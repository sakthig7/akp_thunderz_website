import React, { useEffect, useState } from 'react';
import { getGallery } from '../services/galleryService';
import GalleryItem from '../components/GalleryItem';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const Gallery = () => {
  const [type, setType] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getGallery({ type: type || undefined, page, limit: 24 })
      .then(({ data }) => { setItems(data.data); setPages(Math.ceil(data.total / 24) || 1); })
      .finally(() => setLoading(false));
  }, [type, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="section-title text-center">Gallery</h1>

      <div className="mt-8 flex justify-center gap-2">
        {['', 'photo', 'video'].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => { setType(t); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              type === t ? 'bg-gold text-neutral-950' : 'border border-neutral-700 text-neutral-300 hover:border-gold'
            }`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner full />
      ) : items.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">No media yet.</p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <GalleryItem key={item._id} item={item} onClick={() => setActive(item)} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.title || 'Preview'} wide>
        {active && (active.type === 'video' ? (
          <video src={active.url} controls autoPlay className="w-full rounded-lg" />
        ) : (
          <img src={active.url} alt={active.title} className="w-full rounded-lg" />
        ))}
      </Modal>
    </div>
  );
};

export default Gallery;
