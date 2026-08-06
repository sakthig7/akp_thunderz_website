import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const emptyForm = { name: '', email: '', password: '', role: 'user', isActive: true };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getUsers({ search: search || undefined, limit: 100 }).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, role: form.role, isActive: form.isActive };
        await updateUser(editing._id, payload);
        toast.success('User updated');
      } else {
        await createUser(form);
        toast.success('User created');
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
      await deleteUser(confirmDelete._id);
      toast.success('User deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Manage Users</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add User</button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
        <input className="input pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <Spinner full /> : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-neutral-900">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4 capitalize">{u.role}</td>
                  <td className="py-2 pr-4"><span className={`badge ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-2 pr-4 text-right">
                    <button onClick={() => openEdit(u)} className="mr-2 text-blue-400 hover:text-blue-300"><Pencil size={16} /></button>
                    <button onClick={() => setConfirmDelete(u)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input required disabled={!!editing} type="email" className="input disabled:opacity-60" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          {!editing && (
            <div><label className="label">Password</label><input required type="password" minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          )}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
            </label>
          )}
          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save User'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} message={`Delete user "${confirmDelete?.name}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default ManageUsers;
