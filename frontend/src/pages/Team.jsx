import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getPlayers } from '../services/playerService';
import PlayerCard from '../components/PlayerCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const roles = ['', 'Captain', 'Vice Captain', 'Coach', 'Manager', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

const Team = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getPlayers({ role: role || undefined, search: search || undefined, page, limit: 12 });
        setPlayers(data.data);
        setPages(data.pages);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [role, search, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="section-title text-center">Our Team</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-neutral-400">Captain, coaching staff, and the full playing squad.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
          <input
            className="input pl-9"
            placeholder="Search players..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input sm:w-56" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          {roles.map((r) => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner full />
      ) : players.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">No players found.</p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((p) => <PlayerCard key={p._id} player={p} />)}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Team;
