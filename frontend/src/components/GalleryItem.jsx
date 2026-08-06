import React from 'react';
import { PlayCircle } from 'lucide-react';

const GalleryItem = ({ item, onClick }) => (
  <button onClick={onClick} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-800">
    {item.type === 'video' ? (
      <>
        <video src={item.url} className="h-full w-full object-cover" muted />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <PlayCircle className="text-white" size={40} />
        </div>
      </>
    ) : (
      <img src={item.url} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-110" />
    )}
  </button>
);

export default GalleryItem;
