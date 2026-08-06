import React, { useEffect, useState } from 'react';
import { getMatches } from '../services/matchService';
import MatchCard from '../components/MatchCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const tabs = ['Upcoming', 'Completed', 'Live', 'Cancelled'];

const Matches = () => {
  const [status, setStatus] = useState('Upcoming');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = (showSpinner) => {
      if (showSpinner) setLoading(true);
      getMatches({ status, page, limit: 9 })
        .then(({ data }) => { setMatches(data.data); setPages(Math.ceil(data.total / 9) || 1); })
        .finally(() => setLoading(false));
    };
    load(true);

    // Auto-refresh while viewing live matches so scores update without a manual reload
    if (status === 'Live') {
      const interval = setInterval(() => load(false), 15000);
      return () => clearInterval(interval);
    }
  }, [status, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="section-title text-center">Match Schedule &amp; Results</h1>

      <div className="mt-8 flex justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setStatus(t); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              status === t ? 'bg-gold text-neutral-950' : 'border border-neutral-700 text-neutral-300 hover:border-gold'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner full />
      ) : matches.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">No {status.toLowerCase()} matches.</p>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => <MatchCard key={m._id} match={m} />)}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
};

export default Matches;
