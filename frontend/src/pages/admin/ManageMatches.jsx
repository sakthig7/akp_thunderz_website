import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Radio } from 'lucide-react';
import { getMatches, createMatch, updateMatch, deleteMatch } from '../../services/matchService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const emptyForm = {
  opponent: '', matchType: 'T20', venue: '', date: '', time: '', status: 'Upcoming',
  winner: '', score: '', manOfTheMatch: '', summary: ''
};

const ManageMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getMatches({ limit: 100 }).then(({ data }) => setMatches(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      opponent: m.opponent, matchType: m.matchType, venue: m.venue,
      date: m.date?.slice(0, 10), time: m.time, status: m.status,
      winner: m.result?.winner || '', score: m.result?.score || '',
      manOfTheMatch: m.result?.manOfTheMatch || '', summary: m.result?.summary || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        opponent: form.opponent, matchType: form.matchType, venue: form.venue,
        date: form.date, time: form.time, status: form.status,
        result: { winner: form.winner, score: form.score, manOfTheMatch: form.manOfTheMatch, summary: form.summary }
      };
      if (editing) {
        await updateMatch(editing._id, payload);
        toast.success('Match updated');
      } else {
        await createMatch(payload);
        toast.success('Match created');
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
      await deleteMatch(confirmDelete._id);
      toast.success('Match deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Manage Matches</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add Match</button>
      </div>

      {loading ? <Spinner full /> : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 pr-4">Opponent</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Venue</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Live Score</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m._id} className="border-b border-neutral-900">
                  <td className="py-2 pr-4">{m.opponent}</td>
                  <td className="py-2 pr-4">{format(new Date(m.date), 'dd MMM yyyy')}</td>
                  <td className="py-2 pr-4">{m.venue}</td>
                  <td className="py-2 pr-4">
                    <span className={`badge ${m.status === 'Live' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-neutral-700 text-neutral-300'}`}>{m.status}</span>
                  </td>
                  <td className="py-2 pr-4 max-w-[160px] truncate text-neutral-400">{m.liveScore?.text || '-'}</td>
                  <td className="py-2 pr-4 text-right whitespace-nowrap">
                    <Link to={`/admin/matches/${m._id}/live-scoring`} title="Live scoring" className="mr-2 inline-block text-red-400 hover:text-red-300">
                      <Radio size={16} />
                    </Link>
                    <button onClick={() => openEdit(m)} className="mr-2 text-blue-400 hover:text-blue-300"><Pencil size={16} /></button>
                    <button onClick={() => setConfirmDelete(m)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-neutral-500">No matches yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Match' : 'Add Match'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Opponent</label><input required className="input" value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} /></div>
            <div>
              <label className="label">Match Type</label>
              <select className="input" value={form.matchType} onChange={(e) => setForm({ ...form, matchType: e.target.value })}>
                {['T20', 'ODI', 'Test', 'Friendly', 'Tournament'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Venue</label><input required className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Upcoming', 'Live', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Date</label><input required type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="label">Time</label><input required type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>

          <p className="text-xs text-neutral-500">
            Tip: for ball-by-ball live scoring (batsmen, bowler, overs, wickets), use the <Radio size={12} className="inline text-red-400" /> Live Scoring button on the matches table instead of the fields below — this form is for basic scheduling and the final result summary.
          </p>

          {form.status === 'Completed' && (
            <div className="border-t border-neutral-800 pt-4">
              <h3 className="mb-3 font-display text-lg text-gold">Match Result (manual override)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Winner</label><input className="input" value={form.winner} onChange={(e) => setForm({ ...form, winner: e.target.value })} /></div>
                <div><label className="label">Score</label><input className="input" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
                <div><label className="label">Man of the Match</label><input className="input" value={form.manOfTheMatch} onChange={(e) => setForm({ ...form, manOfTheMatch: e.target.value })} /></div>
              </div>
              <div className="mt-4"><label className="label">Summary</label><textarea rows="3" className="input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            </div>
          )}

          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Match'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        message={`Delete match vs "${confirmDelete?.opponent}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default ManageMatches;
