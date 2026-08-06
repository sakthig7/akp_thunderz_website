import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { getPlayer } from '../services/playerService';
import Spinner from '../components/Spinner';

const StatBox = ({ label, value }) => (
  <div className="rounded-lg bg-neutral-800/70 p-4 text-center">
    <p className="font-display text-2xl text-gold">{value}</p>
    <p className="text-xs text-neutral-400">{label}</p>
  </div>
);

const PlayerProfile = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayer(id).then(({ data }) => setPlayer(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner full />;
  if (!player) return <p className="py-20 text-center text-neutral-500">Player not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Link to="/team" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold">
        <ArrowLeft size={16} /> Back to Team
      </Link>

      <div className="card flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-neutral-800">
          {player.photo ? (
            <img src={player.photo} alt={player.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-5xl text-gold">{player.fullName?.[0]}</div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="font-display text-3xl text-white">{player.fullName}</h1>
          {player.nickname && <p className="text-neutral-500">"{player.nickname}"</p>}
          <p className="mt-1 text-gold">{player.role} &middot; Jersey #{player.jerseyNumber}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-neutral-400 sm:justify-start">
            <span>Batting: {player.battingStyle}</span>
            <span>Bowling: {player.bowlingStyle}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-2xl text-gold">Career Stats</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatBox label="Matches" value={player.stats?.matchesPlayed ?? 0} />
          <StatBox label="Runs" value={player.stats?.runs ?? 0} />
          <StatBox label="Wickets" value={player.stats?.wickets ?? 0} />
          <StatBox label="Strike Rate" value={player.stats?.strikeRate ?? 0} />
          <StatBox label="Average" value={player.stats?.average ?? 0} />
        </div>
      </div>

      {player.awards?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-2xl text-gold">Awards</h2>
          <ul className="space-y-2">
            {player.awards.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-neutral-300"><Award size={16} className="text-gold" /> {a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
