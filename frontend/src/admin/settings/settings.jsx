import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Administrator');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  // Fetch data profil user saat komponen dimuat
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setEmail(data.email || '');
          if (data.role) setRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!name.trim() || !email.trim()) {
      setProfileMsg({ type: 'err', text: 'Name and email are required.' });
      return;
    }

    setSavingProfile(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfileMsg({ type: 'ok', text: data.message || 'Profile updated successfully.' });
      } else {
        setProfileMsg({ type: 'err', text: data.message || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMsg({ type: 'err', text: 'Server connection error.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (!newPass) {
      setPassMsg({ type: 'err', text: 'New password is required.' });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ type: 'err', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'err', text: 'Passwords do not match.' });
      return;
    }

    setSavingPass(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPassMsg({ type: 'ok', text: data.message || 'Password changed successfully.' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassMsg({ type: 'err', text: data.message || 'Failed to update password.' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPassMsg({ type: 'err', text: 'Server connection error.' });
    } finally {
      setSavingPass(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-600';
  const labelCls =
    'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5';

  if (loading) {
    return <div className="text-gray-400 text-sm py-4">Loading profile settings...</div>;
  }

  return (
    <div className="max-w-xl space-y-5">
      {/* Profile */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="font-display font-bold text-base text-white mb-5">Profile</h2>
        {profileMsg && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
              profileMsg.type === 'ok'
                ? 'bg-green-900/30 border-green-800 text-green-300'
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}
          >
            {profileMsg.text}
          </div>
        )}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Administrator"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uks.com"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <div className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-gray-500 capitalize">
              {role}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FF2027' }}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="font-display font-bold text-base text-white mb-5">Change Password</h2>
        {passMsg && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
              passMsg.type === 'ok'
                ? 'bg-green-900/30 border-green-800 text-green-300'
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}
          >
            {passMsg.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={labelCls}>Current Password</label>
            <input
              type="password"
              className={inputCls}
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              className={inputCls}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input
              type="password"
              className={inputCls}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPass}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FF2027' }}
            >
              {savingPass ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h2 className="font-display font-bold text-sm text-white mb-3">System Connection</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          This admin panel is connected to the REST API backend (<strong className="text-gray-400">Node.js / Express</strong>).
          Profile updates and password changes are securely persisted in the database.
        </p>
      </div>
    </div>
  );
}