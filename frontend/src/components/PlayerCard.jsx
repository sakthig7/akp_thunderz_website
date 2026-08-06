import React from 'react';
import { Link } from 'react-router-dom';

const PlayerCard = ({ player }) => (
  <Link to={`/team/${player._id}`} className="card group flex flex-col items-center text-center transition hover:border-gold">
    <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border-2 border-gold bg-neutral-800">
      {player.photo ? (
        <img src={player.photo} alt={player.fullName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-display text-gold">
          {player.fullName?.[0]}
        </div>
      )}
    </div>
    <h3 className="font-display text-xl text-white group-hover:text-gold">{player.fullName}</h3>
    <p className="text-sm text-gold">{player.role}</p>
    <p className="mt-1 text-xs text-neutral-500">Jersey #{player.jerseyNumber}</p>
  </Link>
);

export default PlayerCard;
