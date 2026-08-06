import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Upload, Trash2, PlayCircle } from 'lucide-react';
import { getGallery, uploadGallery, deleteGalleryItem } from '../../services/galleryService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';

const ManageGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    setLoading(true);
    getGallery({ limit: 100 }).then(({ data }) => setItems(data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('Select at least one file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      Array.from(files).forEach((f) => fd.append('files', f));
      await uploadGallery(fd);
      toast.success('Uploaded successfully');
      setTitle('');
      setFiles([]);
      e.target.reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGalleryItem(confirmDelete._id);
      toast.success('Deleted');
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="section-title">Manage Gallery</h1>

      <form onSubmit={handleUpload} className="card mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Title (optional)</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="label">Photos / Videos (multiple allowed)</label>
          <input type="file" multiple accept="image/*,video/mp4" className="input" onChange={(e) => setFiles(e.target.files)} />
        </div>
        <button disabled={uploading} className="btn-primary shrink-0"><Upload size={18} /> {uploading ? 'Uploading...' : 'Upload'}</button>
      </form>

      {loading ? <Spinner full /> : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items.map((item) => (
            <div key={item._id} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-800">
              {item.type === 'video' ? (
                <>
                  <video src={item.url} className="h-full w-full object-cover" muted />
                  <PlayCircle className="absolute inset-0 m-auto text-white" size={28} />
                </>
              ) : (
                <img src={item.url} className="h-full w-full object-cover" />
              )}
              <button
                onClick={() => setConfirmDelete(item)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-red-400 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="col-span-full text-center text-neutral-500">No media uploaded yet.</p>}
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} message="Delete this media item?" onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default ManageGallery;
