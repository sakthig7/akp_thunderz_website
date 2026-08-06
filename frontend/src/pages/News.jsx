import React, { useEffect, useState } from 'react';
import { getNews } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getNews({ page, limit: 9 })
      .then(({ data }) => { setNews(data.data); setPages(Math.ceil(data.total / 9) || 1); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="section-title text-center">News &amp; Announcements</h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-neutral-400">Stay up to date with everything happening at AKP THUNDERz.</p>

      {loading ? (
        <Spinner full />
      ) : news.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">No news posted yet.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => <NewsCard key={n._id} article={n} />)}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default News;
