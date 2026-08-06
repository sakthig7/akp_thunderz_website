import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getNews, createNews, updateNews, deleteNews } from '../../services/newsService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [coverImage, setCoverImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getNews({ limit: 100 }).then(({ data }) => setNews(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ title: '', content: '' }); setCoverImage(null); setModalOpen(true); };
  const openEdit = (n) => { setEditing(n); setForm({ title: n.title, content: n.content }); setCoverImage(null); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      if (coverImage) fd.append('coverImage', coverImage);

      if (editing) {
        await updateNews(editing._id, fd);
        toast.success('Article updated');
      } else {
        await createNews(fd);
        toast.success('Article published');
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
      await deleteNews(confirmDelete._id);
      toast.success('Article deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Manage News</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> New Article</button>
      </div>

      {loading ? <Spinner full /> : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n._id} className="border-b border-neutral-900">
                  <td className="py-2 pr-4">{n.title}</td>
                  <td className="py-2 pr-4">{format(new Date(n.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-2 pr-4 text-right">
                    <button onClick={() => openEdit(n)} className="mr-2 text-blue-400 hover:text-blue-300"><Pencil size={16} /></button>
                    <button onClick={() => setConfirmDelete(n)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-neutral-500">No articles yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Article' : 'New Article'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Title</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Content</label><textarea required rows="8" className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div><label className="label">Cover Image</label><input type="file" accept="image/*" className="input" onChange={(e) => setCoverImage(e.target.files[0])} /></div>
          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Article'}</button>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} message={`Delete article "${confirmDelete?.title}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default ManageNews;
