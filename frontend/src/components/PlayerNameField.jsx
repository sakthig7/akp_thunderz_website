import React from 'react';

// When the relevant team is AKP THUNDERz, restrict selection to roster players
// who have a linked, authenticated account (only they can "participate" in live
// scoring). Otherwise (opponent side), fall back to free-text entry.
const PlayerNameField = ({ isAkp, players, value, onChange, label, required = true, autoFocus = false }) => (
  <div>
    {label && <label className="label">{label}</label>}
    {isAkp ? (
      <select required={required} autoFocus={autoFocus} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select club player...</option>
        {players.map((p) => (
          <option key={p._id} value={p.fullName}>{p.fullName} (#{p.jerseyNumber})</option>
        ))}
      </select>
    ) : (
      <input required={required} autoFocus={autoFocus} className="input" placeholder="Opponent player name" value={value} onChange={(e) => onChange(e.target.value)} />
    )}
    {isAkp && players.length === 0 && (
      <p className="mt-1 text-xs text-yellow-500">No club players have linked accounts yet — link one in Manage Players first.</p>
    )}
  </div>
);

export default PlayerNameField;
