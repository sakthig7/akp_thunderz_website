import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, Link2 } from 'lucide-react';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../../services/playerService';
import { getUsers } from '../../services/userService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';

const emptyForm = {
  fullName: '', nickname: '', jerseyNumber: '', role: 'Batsman', battingStyle: 'Right-Handed',
  bowlingStyle: '', matchesPlayed: 0, runs: 0, wickets: 0, strikeRate: 0, average: 0, awards: '', user: ''
};

const ManagePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [users, setUsers] = useState([]);

  const load = () => {
    setLoading(true);
    getPlayers({ search: search || undefined, page, limit: 10 })
      .then(({ data }) => { setPlayers(data.data); setPages(data.pages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, page]);
  useEffect(() => { getUsers({ limit: 200 }).then(({ data }) => setUsers(data.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setPhoto(null); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      fullName: p.fullName, nickname: p.nickname || '', jerseyNumber: p.jerseyNumber, role: p.role,
      battingStyle: p.battingStyle, bowlingStyle: p.bowlingStyle,
      matchesPlayed: p.stats?.matchesPlayed || 0, runs: p.stats?.runs || 0, wickets: p.stats?.wickets || 0,
      strikeRate: p.stats?.strikeRate || 0, average: p.stats?.average || 0, awards: (p.awards || []).join(', '),
      user: p.user?._id || p.user || ''
    });
    setPhoto(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('nickname', form.nickname);
      fd.append('jerseyNumber', form.jerseyNumber);
      fd.append('role', form.role);
      fd.append('battingStyle', form.battingStyle);
      fd.append('bowlingStyle', form.bowlingStyle);
      fd.append('stats[matchesPlayed]', form.matchesPlayed);
      fd.append('stats[runs]', form.runs);
      fd.append('stats[wickets]', form.wickets);
      fd.append('stats[strikeRate]', form.strikeRate);
      fd.append('stats[average]', form.average);
      form.awards.split(',').map((a) => a.trim()).filter(Boolean).forEach((a) => fd.append('awards[]', a));
      if (form.user) fd.append('user', form.user);
      if (photo) fd.append('photo', photo);

      if (editing) {
        await updatePlayer(editing._id, fd);
        toast.success('Player updated');
      } else {
        await createPlayer(fd);
        toast.success('Player created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlayer(confirmDelete._id);
      toast.success('Player deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Manage Players</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add Player</button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
        <input className="input pl-9" placeholder="Search players..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {loading ? <Spinner full /> : (
        <>
          <div className="mt-6 overflow-x-auto card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="py-2 pr-4">Photo</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Jersey</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Account</th>
                  <th className="py-2 pr-4">Runs</th>
                  <th className="py-2 pr-4">Wickets</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p._id} className="border-b border-neutral-900">
                    <td className="py-2 pr-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
                        {p.photo && <img src={p.photo} className="h-full w-full object-cover" />}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{p.fullName}</td>
                    <td className="py-2 pr-4">#{p.jerseyNumber}</td>
                    <td className="py-2 pr-4">{p.role}</td>
                    <td className="py-2 pr-4">
                      {p.user ? (
                        <span className="badge bg-green-500/20 text-green-400"><Link2 size={12} className="inline" /> Linked</span>
                      ) : (
                        <span className="badge bg-neutral-700 text-neutral-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{p.stats?.runs}</td>
                    <td className="py-2 pr-4">{p.stats?.wickets}</td>
                    <td className="py-2 pr-4 text-right">
                      <button onClick={() => openEdit(p)} className="mr-2 text-blue-400 hover:text-blue-300"><Pencil size={16} /></button>
                      <button onClick={() => setConfirmDelete(p)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-neutral-500">No players found.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Player' : 'Add Player'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Full Name</label><input required className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="label">Nickname</label><input className="input" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} /></div>
            <div><label className="label">Jersey Number</label><input required type="number" className="input" value={form.jerseyNumber} onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} /></div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {['Captain', 'Vice Captain', 'Coach', 'Manager', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Batting Style</label>
              <select className="input" value={form.battingStyle} onChange={(e) => setForm({ ...form, battingStyle: e.target.value })}>
                <option>Right-Handed</option><option>Left-Handed</option><option>N/A</option>
              </select>
            </div>
            <div><label className="label">Bowling Style</label><input className="input" value={form.bowlingStyle} onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value })} /></div>
          </div>

          <div className="border-t border-neutral-800 pt-4">
            <label className="label">Linked User Account</label>
            <select className="input" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })}>
              <option value="">Not linked</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Only players linked to a registered account can be selected during live scoring, and only their stats update automatically from match scorecards.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div><label className="label">Matches</label><input type="number" className="input" value={form.matchesPlayed} onChange={(e) => setForm({ ...form, matchesPlayed: e.target.value })} /></div>
            <div><label className="label">Runs</label><input type="number" className="input" value={form.runs} onChange={(e) => setForm({ ...form, runs: e.target.value })} /></div>
            <div><label className="label">Wickets</label><input type="number" className="input" value={form.wickets} onChange={(e) => setForm({ ...form, wickets: e.target.value })} /></div>
            <div><label className="label">Strike Rate</label><input type="number" step="0.01" className="input" value={form.strikeRate} onChange={(e) => setForm({ ...form, strikeRate: e.target.value })} /></div>
            <div><label className="label">Average</label><input type="number" step="0.01" className="input" value={form.average} onChange={(e) => setForm({ ...form, average: e.target.value })} /></div>
          </div>

          <div><label className="label">Awards (comma separated)</label><input className="input" value={form.awards} onChange={(e) => setForm({ ...form, awards: e.target.value })} /></div>
          <div><label className="label">Photo</label><input type="file" accept="image/*" className="input" onChange={(e) => setPhoto(e.target.files[0])} /></div>

          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Player'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        message={`Delete player "${confirmDelete?.fullName}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManagePlayers;
