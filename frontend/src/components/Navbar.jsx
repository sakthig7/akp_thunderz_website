import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/matches', label: 'Matches' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/register', label: 'Join Us' },
  { to: '/contact', label: 'Contact' }
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('akp_theme') !== 'light');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('akp_theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AKP THUNDERz" className="h-11 w-11 rounded-full object-cover ring-2 ring-gold" />
          <span className="font-display text-2xl text-gold hidden sm:block">AKP THUNDERz</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-gold ${isActive ? 'text-gold' : 'text-neutral-300'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button onClick={() => setDark((d) => !d)} className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800" title="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="btn-secondary px-3 py-1.5 text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <Link to="/profile" className="btn-secondary px-3 py-1.5 text-sm">
                <UserIcon size={16} /> {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-danger px-3 py-1.5 text-sm">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-4 py-1.5 text-sm">Login</Link>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-neutral-200 hover:text-gold">
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-neutral-800 pt-3">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="btn-secondary px-3 py-1.5 text-sm">Dashboard</Link>
                  )}
                  <Link to="/profile" onClick={() => setOpen(false)} className="btn-secondary px-3 py-1.5 text-sm">Profile</Link>
                  <button onClick={handleLogout} className="btn-danger px-3 py-1.5 text-sm">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="btn-primary px-4 py-1.5 text-sm">Login</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
