import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Phone, Mail } from 'lucide-react';
import { submitContact } from '../services/contactService';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact(form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="section-title text-center">Contact Us</h1>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div><label className="label">Name</label><input required name="name" className="input" value={form.name} onChange={handleChange} /></div>
          <div><label className="label">Email</label><input required type="email" name="email" className="input" value={form.email} onChange={handleChange} /></div>
          <div><label className="label">Subject</label><input name="subject" className="input" value={form.subject} onChange={handleChange} /></div>
          <div><label className="label">Message</label><textarea required rows="5" name="message" className="input" value={form.message} onChange={handleChange} /></div>
          <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Sending...' : 'Send Message'}</button>
        </form>

        <div className="space-y-6">
          <div className="card">
            <h3 className="mb-3 font-display text-xl text-gold">Get in Touch</h3>
            <ul className="space-y-3 text-neutral-300">
              <li className="flex items-center gap-3"><MapPin className="text-gold" size={18} /> Club Ground, Your City, State</li>
              <li className="flex items-center gap-3"><Phone className="text-gold" size={18} /> +91 00000 00000</li>
              <li className="flex items-center gap-3"><Mail className="text-gold" size={18} /> info@akpthunderz.com</li>
            </ul>
          </div>
          <div className="h-64 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-600">
            Google Map Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
