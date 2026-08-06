import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <h1 className="font-display text-7xl text-gold">404</h1>
    <p className="mt-3 text-neutral-400">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6">Back to Home</Link>
  </div>
);

export default NotFound;
