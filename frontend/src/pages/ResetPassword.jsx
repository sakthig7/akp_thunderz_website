import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(token, { password });
      toast.success('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14">
      <h1 className="section-title text-center">Reset Password</h1>
      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div><label className="label">New Password</label><input required type="password" minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
};

export default ResetPassword;
