import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => (
  <footer className="mt-16 border-t border-neutral-800 bg-neutral-950">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <img src="/logo.png" alt="AKP THUNDERz" className="h-10 w-10 rounded-full object-cover ring-2 ring-gold" />
          <span className="font-display text-xl text-gold">AKP THUNDERz</span>
        </div>
        <p className="text-sm text-neutral-400">Play Hard &middot; Play Smart &middot; Play Together</p>
      </div>

      <div>
        <h4 className="mb-3 font-display text-lg text-gold">Quick Links</h4>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li><Link to="/about" className="hover:text-gold">About Club</Link></li>
          <li><Link to="/team" className="hover:text-gold">Team</Link></li>
          <li><Link to="/matches" className="hover:text-gold">Matches</Link></li>
          <li><Link to="/register" className="hover:text-gold">Join Us</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-display text-lg text-gold">Contact</h4>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li className="flex items-center gap-2"><MapPin size={16} /> Club Ground, Your City</li>
          <li className="flex items-center gap-2"><Phone size={16} /> +91 00000 00000</li>
          <li className="flex items-center gap-2"><Mail size={16} /> info@akpthunderz.com</li>
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-display text-lg text-gold">Follow Us</h4>
        <div className="flex gap-3">
          {[Facebook, Instagram, Youtube, Twitter, MessageCircle].map((Icon, i) => (
            <a key={i} href="#" className="rounded-full border border-neutral-700 p-2 text-neutral-400 transition hover:border-gold hover:text-gold">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
      &copy; {new Date().getFullYear()} AKP THUNDERz Cricket Club. All rights reserved.
    </div>
  </footer>
);

export default Footer;
