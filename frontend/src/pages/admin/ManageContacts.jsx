import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';
import { getContacts, updateContact, deleteContact } from '../../services/contactService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const ManageContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getContacts().then(({ data }) => setContacts(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openView = async (c) => {
    setViewing(c);
    if (!c.isRead) {
      try { await updateContact(c._id, { isRead: true }); load(); } catch { /* ignore */ }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact(confirmDelete._id);
      toast.success('Message deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="section-title">Contact Messages</h1>

      {loading ? <Spinner full /> : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 pr-4">From</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} className="border-b border-neutral-900">
                  <td className="py-2 pr-4">{c.name} <span className="text-neutral-500">({c.email})</span></td>
                  <td className="py-2 pr-4">{c.subject || '-'}</td>
                  <td className="py-2 pr-4">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-2 pr-4"><span className={`badge ${c.isRead ? 'bg-neutral-700 text-neutral-300' : 'bg-blue-500/20 text-blue-400'}`}>{c.isRead ? 'Read' : 'New'}</span></td>
                  <td className="py-2 pr-4 text-right">
                    <button onClick={() => openView(c)} className="mr-2 text-blue-400 hover:text-blue-300"><Eye size={16} /></button>
                    <button onClick={() => setConfirmDelete(c)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No messages yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.subject || 'Message'}>
        {viewing && (
          <div className="space-y-2 text-sm text-neutral-300">
            <p><strong>From:</strong> {viewing.name} ({viewing.email})</p>
            <p className="whitespace-pre-line pt-2">{viewing.message}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDelete} message={`Delete message from "${confirmDelete?.name}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default ManageContacts;
