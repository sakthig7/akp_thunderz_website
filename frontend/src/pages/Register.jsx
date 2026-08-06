import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="section-title text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div><label className="label">Full Name</label><input required name="name" className="input" value={form.name} onChange={handleChange} /></div>
        <div><label className="label">Email</label><input required type="email" name="email" className="input" value={form.email} onChange={handleChange} /></div>
        <div><label className="label">Phone</label><input name="phone" className="input" value={form.phone} onChange={handleChange} /></div>
        <div><label className="label">Password</label><input required type="password" minLength={6} name="password" className="input" value={form.password} onChange={handleChange} /></div>
        <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Creating...' : 'Create Account'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-400">
        Already have an account? <Link to="/login" className="text-gold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
