import React from 'react';

const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        className="btn-secondary px-3 py-1.5 text-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="text-sm text-neutral-400">
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary px-3 py-1.5 text-sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
