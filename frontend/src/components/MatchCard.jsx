import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock } from 'lucide-react';
import LiveScoreboard from './LiveScoreboard';

const statusColors = {
  Upcoming: 'bg-blue-500/20 text-blue-400',
  Live: 'bg-red-500/20 text-red-400 animate-pulse',
  Completed: 'bg-green-500/20 text-green-400',
  Cancelled: 'bg-neutral-500/20 text-neutral-400'
};

const MatchCard = ({ match }) => (
  <div className="card">
    <div className="mb-3 flex items-center justify-between">
      <span className={`badge ${statusColors[match.status]}`}>{match.status}</span>
      <span className="text-xs text-neutral-500">{match.matchType}</span>
    </div>
    <h3 className="font-display text-xl text-white">AKP THUNDERz vs {match.opponent}</h3>
    <div className="mt-3 space-y-1.5 text-sm text-neutral-400">
      <p className="flex items-center gap-2"><Calendar size={14} /> {format(new Date(match.date), 'dd MMM yyyy')}</p>
      <p className="flex items-center gap-2"><Clock size={14} /> {match.time}</p>
      <p className="flex items-center gap-2"><MapPin size={14} /> {match.venue}</p>
    </div>

    {match.status === 'Live' && (
      <div className="mt-4">
        {match.liveMatchData ? (
          <LiveScoreboard liveMatchData={match.liveMatchData} />
        ) : match.liveScore?.text ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3">
            <p className="font-display text-lg text-red-400">{match.liveScore.text}</p>
          </div>
        ) : null}
      </div>
    )}

    {match.status === 'Completed' && match.result?.winner && (
      <div className="mt-4 rounded-md bg-neutral-800/70 p-3 text-sm">
        <p className="font-semibold text-gold">Winner: {match.result.winner}</p>
        {match.result.score && <p className="text-neutral-400">{match.result.score}</p>}
        {match.result.manOfTheMatch && <p className="text-neutral-400">MoM: {match.result.manOfTheMatch}</p>}
      </div>
    )}
  </div>
);

export default MatchCard;
