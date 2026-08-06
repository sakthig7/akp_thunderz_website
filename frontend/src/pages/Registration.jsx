import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { submitRegistration } from '../services/registrationService';

const initial = {
  name: '', dob: '', mobile: '', email: '', address: '', occupation: '', cricketRole: '', experience: ''
};

const Registration = () => {
  const [form, setForm] = useState(initial);
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      await submitRegistration(fd);
      toast.success('Registration submitted! Await admin approval.');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-gold">Thank you!</h1>
        <p className="mt-3 text-neutral-400">Your registration has been received. Our admin team will review it shortly.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="section-title text-center">Join AKP THUNDERz</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-neutral-400">Fill out the form below to apply for club membership.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full Name</label><input required name="name" className="input" value={form.name} onChange={handleChange} /></div>
          <div><label className="label">Date of Birth</label><input required type="date" name="dob" className="input" value={form.dob} onChange={handleChange} /></div>
          <div><label className="label">Mobile Number</label><input required name="mobile" className="input" value={form.mobile} onChange={handleChange} /></div>
          <div><label className="label">Email</label><input required type="email" name="email" className="input" value={form.email} onChange={handleChange} /></div>
        </div>
        <div><label className="label">Address</label><textarea required name="address" rows="2" className="input" value={form.address} onChange={handleChange} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Occupation</label><input name="occupation" className="input" value={form.occupation} onChange={handleChange} /></div>
          <div>
            <label className="label">Cricket Role</label>
            <select required name="cricketRole" className="input" value={form.cricketRole} onChange={handleChange}>
              <option value="">Select role</option>
              <option>Batsman</option><option>Bowler</option><option>All-Rounder</option><option>Wicket-Keeper</option>
            </select>
          </div>
        </div>
        <div><label className="label">Experience</label><textarea name="experience" rows="2" className="input" value={form.experience} onChange={handleChange} placeholder="Years playing, leagues, achievements..." /></div>
        <div>
          <label className="label">Upload Photo</label>
          <input type="file" accept="image/*" className="input" onChange={(e) => setPhoto(e.target.files[0])} />
        </div>
        <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Submitting...' : 'Submit Registration'}</button>
      </form>
    </div>
  );
};

export default Registration;
