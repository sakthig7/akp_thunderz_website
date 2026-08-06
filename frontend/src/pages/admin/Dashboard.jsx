import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Shield, Trophy, CheckCircle, Image, Newspaper, ClipboardList, Mail } from 'lucide-react';
import { getStats } from '../../services/dashboardService';
import Spinner from '../../components/Spinner';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`rounded-lg p-3 ${color}`}><Icon size={22} className="text-neutral-950" /></div>
    <div>
      <p className="font-display text-2xl text-white">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(({ data }) => setStats(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;
  if (!stats) return null;

  const chartData = [
    { name: 'Players', value: stats.totalPlayers },
    { name: 'Users', value: stats.totalUsers },
    { name: 'Upcoming', value: stats.upcomingMatches },
    { name: 'Completed', value: stats.completedMatches },
    { name: 'Gallery', value: stats.galleryCount },
    { name: 'News', value: stats.newsCount }
  ];

  return (
    <div>
      <h1 className="section-title">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Shield} label="Total Players" value={stats.totalPlayers} color="bg-gold" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-400" />
        <StatCard icon={Trophy} label="Upcoming Matches" value={stats.upcomingMatches} color="bg-purple-400" />
        <StatCard icon={CheckCircle} label="Completed Matches" value={stats.completedMatches} color="bg-green-400" />
        <StatCard icon={Image} label="Gallery Items" value={stats.galleryCount} color="bg-pink-400" />
        <StatCard icon={Newspaper} label="News Posts" value={stats.newsCount} color="bg-orange-400" />
        <StatCard icon={ClipboardList} label="Pending Registrations" value={stats.pendingRegistrations} color="bg-red-400" />
        <StatCard icon={Mail} label="Unread Messages" value={stats.unreadContacts} color="bg-cyan-400" />
      </div>

      <div className="card mt-8">
        <h2 className="mb-4 font-display text-xl text-gold">Overview</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" fontSize={12} />
            <YAxis stroke="#999" fontSize={12} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #D4AF37' }} />
            <Bar dataKey="value" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="mb-3 font-display text-lg text-gold">Recent Registrations</h3>
          <ul className="space-y-2 text-sm">
            {stats.recentActivity.registrations.map((r) => (
              <li key={r._id} className="flex justify-between border-b border-neutral-800 pb-2">
                <span>{r.name}</span>
                <span className="text-neutral-500">{r.status}</span>
              </li>
            ))}
            {stats.recentActivity.registrations.length === 0 && <li className="text-neutral-500">None yet</li>}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 font-display text-lg text-gold">Recent Matches</h3>
          <ul className="space-y-2 text-sm">
            {stats.recentActivity.matches.map((m) => (
              <li key={m._id} className="flex justify-between border-b border-neutral-800 pb-2">
                <span>vs {m.opponent}</span>
                <span className="text-neutral-500">{format(new Date(m.date), 'dd MMM')}</span>
              </li>
            ))}
            {stats.recentActivity.matches.length === 0 && <li className="text-neutral-500">None yet</li>}
          </ul>
        </div>
        <div className="card">
          <h3 className="mb-3 font-display text-lg text-gold">Recent News</h3>
          <ul className="space-y-2 text-sm">
            {stats.recentActivity.news.map((n) => (
              <li key={n._id} className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="truncate">{n.title}</span>
                <span className="text-neutral-500">{format(new Date(n.createdAt), 'dd MMM')}</span>
              </li>
            ))}
            {stats.recentActivity.news.length === 0 && <li className="text-neutral-500">None yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
