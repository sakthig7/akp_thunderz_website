import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="section-title text-center">Member Login</h1>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Password</label><input required type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-gold hover:underline">Forgot password?</Link></div>
        <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-400">
        Don't have an account? <Link to="/signup" className="text-gold hover:underline">Register</Link>
      </p>
      <p className="mt-2 text-center text-xs text-neutral-600">
        Are you an admin? <Link to="/admin/login" className="hover:text-gold">Admin Login</Link>
      </p>
    </div>
  );
};

export default Login;
