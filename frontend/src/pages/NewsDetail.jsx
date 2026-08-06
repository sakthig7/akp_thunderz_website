import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { getNewsArticle } from '../services/newsService';
import Spinner from '../components/Spinner';

const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsArticle(id).then(({ data }) => setArticle(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!article) return <p className="py-20 text-center text-neutral-500">Article not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/news" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold">
        <ArrowLeft size={16} /> Back to News
      </Link>

      {article.coverImage && (
        <img src={article.coverImage} alt={article.title} className="mb-6 w-full rounded-xl border border-neutral-800" />
      )}

      <p className="text-xs text-neutral-500">
        {format(new Date(article.createdAt), 'dd MMM yyyy')} {article.author?.name ? `· by ${article.author.name}` : ''}
      </p>
      <h1 className="mt-2 font-display text-3xl text-white">{article.title}</h1>
      <div className="prose prose-invert mt-6 max-w-none whitespace-pre-line text-neutral-300">{article.content}</div>
    </div>
  );
};

export default NewsDetail;
