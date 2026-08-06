import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Trophy, Image, Newspaper, ClipboardList, Mail, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/players', label: 'Players', icon: ShieldCheck },
  { to: '/admin/matches', label: 'Matches', icon: Trophy },
  { to: '/admin/gallery', label: 'Gallery', icon: Image },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/contacts', label: 'Messages', icon: Mail },
  { to: '/admin/users', label: 'Users', icon: Users }
];

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const Sidebar = (
    <div className="flex h-full flex-col bg-neutral-900 p-4">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <img src="/logo.png" className="h-9 w-9 rounded-full object-cover ring-2 ring-gold" alt="logo" />
        <span className="font-display text-lg text-gold">Admin Panel</span>
      </Link>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gold text-neutral-950' : 'text-neutral-300 hover:bg-neutral-800'
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-neutral-800 pt-4">
        <p className="mb-2 truncate px-2 text-xs text-neutral-500">{user?.email}</p>
        <button onClick={handleLogout} className="btn-danger w-full text-sm">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <aside className="hidden w-64 shrink-0 border-r border-neutral-800 lg:block">{Sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 border-r border-neutral-800">{Sidebar}</div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 lg:hidden">
          <span className="font-display text-lg text-gold">Admin Panel</span>
          <button onClick={() => setOpen(true)}><Menu size={24} /></button>
        </div>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
