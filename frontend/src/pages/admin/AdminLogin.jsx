import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminLogin(form);
      toast.success('Welcome, Admin');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="AKP THUNDERz" className="h-20 w-20 rounded-full ring-2 ring-gold object-cover" />
          <h1 className="mt-3 font-display text-3xl text-gold">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div><label className="label">Admin Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input required type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link to="/" className="hover:text-gold">Back to site</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
