import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/authService';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await updateProfile(form);
      refreshUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Change failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="section-title text-center">My Profile</h1>

      <form onSubmit={handleProfileSubmit} className="card mt-8 space-y-4">
        <h2 className="font-display text-xl text-gold">Profile Details</h2>
        <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input disabled className="input opacity-60" value={user?.email || ''} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <button disabled={savingProfile} className="btn-primary">{savingProfile ? 'Saving...' : 'Save Changes'}</button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card mt-6 space-y-4">
        <h2 className="font-display text-xl text-gold">Change Password</h2>
        <div><label className="label">Current Password</label><input required type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} /></div>
        <div><label className="label">New Password</label><input required type="password" minLength={6} className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} /></div>
        <button disabled={savingPw} className="btn-primary">{savingPw ? 'Updating...' : 'Change Password'}</button>
      </form>
    </div>
  );
};

export default Profile;
