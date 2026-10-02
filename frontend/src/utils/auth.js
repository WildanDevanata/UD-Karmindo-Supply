// auth.js - Fixed & Secure Version

const API_BASE_URL = 'http://localhost:5000/api';
const SESSION_KEY = 'uks_admin_session';
const USERS_KEY = 'uks_admin_users';

// Helper SHA-256 untuk hashing password lokal
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function storeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed default admin jika localStorage masih kosong
export async function seedDefaultAdmin() {
  const users = getStoredUsers();
  if (users.length === 0) {
    const hash = await sha256('admin123');
    storeUsers([
      {
        id: 'usr-1',
        name: 'Administrator',
        email: 'admin@uks.com',
        passwordHash: hash,
        role: 'Administrator',
        createdAt: new Date().toISOString(),
      },
    ]);
  }
}

// LOGIN: Selalu wajib mencocokkan password!
export async function login(email, password) {
  const inputEmail = email.trim().toLowerCase();
  const inputHash = await sha256(password);

  // 1. Coba verifikasi dengan Express Server jika API login tersedia
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inputEmail, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const session = {
        id: data.user?.id || 'usr-1',
        name: data.user?.name || 'Administrator',
        email: data.user?.email || inputEmail,
        role: data.user?.role || 'Administrator',
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // Update password hash lokal agar sync dengan password terbaru
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === inputEmail);
      if (idx !== -1) {
        users[idx].passwordHash = inputHash;
        storeUsers(users);
      } else {
        users.push({ ...session, passwordHash: inputHash });
        storeUsers(users);
      }

      return session;
    } else if (res.status === 401 || res.status === 400) {
      // Jika server menjawab "Password Salah" atau "User Tidak Ditemukan"
      return null;
    }
  } catch (err) {
    console.warn('Backend server tidak dapat dijangkau, beralih ke verifikasi lokal.');
  }

  // 2. Fallback: Verifikasi Local Storage (STRICT VALIDATION)
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === inputEmail);

  // Jika user tidak ada ATAU passwordHash tidak ada -> TOLAK LOGIN
  if (!user || !user.passwordHash) {
    return null;
  }

  // Bandingkan hash password input dengan hash yang tersimpan
  if (inputHash !== user.passwordHash) {
    return null; // Password Salah!
  }

  // Jika cocok, buat sesi login
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

// UBAH PASSWORD
export async function changePassword(userId, newPassword, currentPassword = '') {
  const newHash = await sha256(newPassword);

  // Update di server Express
  try {
    await fetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (err) {
    console.warn('Gagal mengubah password di server:', err);
  }

  // Wajib Update di LocalStorage
  const users = getStoredUsers();
  const session = getSession();
  const targetEmail = session?.email?.toLowerCase();

  const idx = users.findIndex(u => u.id === userId || u.email.toLowerCase() === targetEmail);
  if (idx !== -1) {
    users[idx].passwordHash = newHash;
    storeUsers(users);
    return true;
  }

  return false;
}

// UPDATE PROFILE
export async function updateProfile(userId, name, email) {
  try {
    await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
  } catch (err) {
    console.warn('Gagal memperbarui profil di server:', err);
  }

  const users = getStoredUsers();
  const session = getSession();
  const targetEmail = session?.email?.toLowerCase();

  const idx = users.findIndex(u => u.id === userId || u.email.toLowerCase() === targetEmail);
  if (idx !== -1) {
    users[idx].name = name;
    users[idx].email = email;
    storeUsers(users);
  }

  if (session) {
    const updatedSession = { ...session, name, email };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }

  return true;
}

// Inisialisasi awal
seedDefaultAdmin();