// Simple SHA-256 based password hashing (browser-native)
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const SESSION_KEY = 'uks_admin_session';
const USERS_KEY = 'uks_admin_users';

// Seed default admin on first run
export async function seedDefaultAdmin() {
  const users = getStoredUsers();
  if (users.length === 0) {
    const hash = await sha256('admin123');
    storeUsers([
      {
        id: '1',
        name: 'Administrator',
        email: 'admin@uks.com',
        passwordHash: hash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ]);
  }
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

export async function login(email, password) {
  const users = getStoredUsers();
  const user = users.find(u => u.email === email);
  if (!user) return null;
  const hash = await sha256(password);
  if (hash !== user.passwordHash) return null;
  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
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
    const user = JSON.parse(raw);
    if (user.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export async function changePassword(userId, newPassword) {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].passwordHash = await sha256(newPassword);
  storeUsers(users);
  return true;
}

export function updateProfile(userId, name, email) {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].name = name;
  users[idx].email = email;
  storeUsers(users);
  const session = getSession();
  if (session && session.id === userId) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, name, email }));
  }
  return true;
}

// Otomatis jalankan seed saat file pertama kali di-load
seedDefaultAdmin();