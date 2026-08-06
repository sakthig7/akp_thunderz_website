import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset instructions generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="section-title text-center">Forgot Password</h1>
      {sent ? (
        <p className="card mt-8 text-center text-neutral-300">
          If an account exists for that email, password reset instructions have been generated. Check with the club admin if you don't receive them.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
          <div><label className="label">Email</label><input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-neutral-400">
        <Link to="/login" className="text-gold hover:underline">Back to Login</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
