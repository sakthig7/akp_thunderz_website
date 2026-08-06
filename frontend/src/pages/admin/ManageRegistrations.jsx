import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, Eye, Trash2 } from 'lucide-react';
import { getRegistrations, updateRegistrationStatus, deleteRegistration } from '../../services/registrationService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const statusColors = { Pending: 'bg-yellow-500/20 text-yellow-400', Approved: 'bg-green-500/20 text-green-400', Rejected: 'bg-red-500/20 text-red-400' };

const ManageRegistrations = () => {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getRegistrations({ status: status || undefined, limit: 100 }).then(({ data }) => setRegs(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const handleStatus = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, { status: newStatus });
      toast.success(`Registration ${newStatus.toLowerCase()}`);
      load();
      setViewing(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRegistration(confirmDelete._id);
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="section-title">Registrations</h1>

      <div className="mt-4 flex gap-2">
        {['', 'Pending', 'Approved', 'Rejected'].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${status === s ? 'bg-gold text-neutral-950' : 'border border-neutral-700 text-neutral-300 hover:border-gold'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner full /> : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Applied</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r._id} className="border-b border-neutral-900">
                  <td className="py-2 pr-4">{r.name}</td>
                  <td className="py-2 pr-4">{r.cricketRole}</td>
                  <td className="py-2 pr-4">{format(new Date(r.createdAt), 'dd MMM yyyy')}</td>
                  <td className="py-2 pr-4"><span className={`badge ${statusColors[r.status]}`}>{r.status}</span></td>
                  <td className="py-2 pr-4 text-right">
                    <button onClick={() => setViewing(r)} className="mr-2 text-blue-400 hover:text-blue-300"><Eye size={16} /></button>
                    <button onClick={() => setConfirmDelete(r)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {regs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-neutral-500">No registrations.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Registration Details">
        {viewing && (
          <div className="space-y-2 text-sm text-neutral-300">
            {viewing.photo && <img src={viewing.photo} className="mb-3 h-24 w-24 rounded-full object-cover" />}
            <p><strong>Name:</strong> {viewing.name}</p>
            <p><strong>DOB:</strong> {format(new Date(viewing.dob), 'dd MMM yyyy')}</p>
            <p><strong>Mobile:</strong> {viewing.mobile}</p>
            <p><strong>Email:</strong> {viewing.email}</p>
            <p><strong>Address:</strong> {viewing.address}</p>
            <p><strong>Occupation:</strong> {viewing.occupation || '-'}</p>
            <p><strong>Cricket Role:</strong> {viewing.cricketRole}</p>
            <p><strong>Experience:</strong> {viewing.experience || '-'}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleStatus(viewing._id, 'Approved')} className="btn-primary flex-1"><Check size={16} /> Approve</button>
              <button onClick={() => handleStatus(viewing._id, 'Rejected')} className="btn-danger flex-1"><X size={16} /> Reject</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDelete} message={`Delete registration for "${confirmDelete?.name}"?`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default ManageRegistrations;
