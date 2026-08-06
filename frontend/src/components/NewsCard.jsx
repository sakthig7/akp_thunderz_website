import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const NewsCard = ({ article }) => (
  <Link to={`/news/${article._id}`} className="card group block overflow-hidden">
    {article.coverImage && (
      <div className="-mx-5 -mt-5 mb-4 h-44 overflow-hidden">
        <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>
    )}
    <p className="text-xs text-neutral-500">{format(new Date(article.createdAt), 'dd MMM yyyy')}</p>
    <h3 className="mt-1 font-display text-xl text-white group-hover:text-gold">{article.title}</h3>
    <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{article.content}</p>
  </Link>
);

export default NewsCard;
