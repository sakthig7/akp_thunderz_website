import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getMatch } from '../services/matchService';
import MatchCard from '../components/MatchCard';
import LiveScoreboard from '../components/LiveScoreboard';
import Spinner from '../components/Spinner';

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = (showSpinner) => {
      if (showSpinner) setLoading(true);
      getMatch(id).then(({ data }) => setMatch(data.data)).finally(() => setLoading(false));
    };
    load(true);
  }, [id]);

  // Auto-refresh every 15s while the match is live
  useEffect(() => {
    if (match?.status !== 'Live') return;
    const interval = setInterval(() => {
      getMatch(id).then(({ data }) => setMatch(data.data));
    }, 15000);
    return () => clearInterval(interval);
  }, [id, match?.status]);

  if (loading) return <Spinner full />;
  if (!match) return <p className="py-20 text-center text-neutral-500">Match not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/matches" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold">
        <ArrowLeft size={16} /> Back to Matches
      </Link>
      <MatchCard match={match} />

      {match.status === 'Completed' && match.liveMatchData?.innings?.length > 0 && (
        <div className="mt-6">
          <LiveScoreboard
            liveMatchData={{ ...match.liveMatchData, currentInnings: match.liveMatchData.innings.length }}
            isLive={false}
            defaultTab="scorecard"
          />
        </div>
      )}

      {match.result?.scoreboard?.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <h2 className="mb-4 font-display text-xl text-gold">Scoreboard</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="py-2">Player</th>
                <th className="py-2">Runs</th>
                <th className="py-2">Balls</th>
                <th className="py-2">Wickets</th>
                <th className="py-2">Overs</th>
              </tr>
            </thead>
            <tbody>
              {match.result.scoreboard.map((row, i) => (
                <tr key={i} className="border-b border-neutral-900">
                  <td className="py-2">{row.playerName}</td>
                  <td className="py-2">{row.runs ?? '-'}</td>
                  <td className="py-2">{row.balls ?? '-'}</td>
                  <td className="py-2">{row.wickets ?? '-'}</td>
                  <td className="py-2">{row.overs ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {match.result?.summary && (
        <div className="card mt-6">
          <h2 className="mb-2 font-display text-xl text-gold">Match Summary</h2>
          <p className="text-neutral-300">{match.result.summary}</p>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
