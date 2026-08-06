import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full ${wide ? 'max-w-3xl' : 'max-w-md'} overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl text-gold">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
