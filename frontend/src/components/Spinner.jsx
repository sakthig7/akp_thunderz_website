import React from 'react';

const Spinner = ({ full, size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-14 w-14 border-4' };
  const spinner = <div className={`animate-spin rounded-full border-gold border-t-transparent ${sizes[size]}`} />;

  if (full) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default Spinner;
