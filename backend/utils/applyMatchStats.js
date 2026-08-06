const Player = require('../models/Player');

// Only "AKP THUNDERz" (however it's spelled/cased on the day) is treated as our own
// roster — an opponent's players never get matched, since only linked club players
// exist in the Player collection at all.
const isOurTeam = (teamName) => /thunderz/i.test(teamName || '');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds a roster Player by name, but ONLY among players that have a linked user
// account — unlinked roster entries never get their stats touched automatically.
const findLinkedPlayerByName = async (name) => {
  if (!name) return null;
  const pattern = new RegExp(`^${escapeRegex(name.trim())}$`, 'i');
  return Player.findOne({ user: { $ne: null }, $or: [{ fullName: pattern }, { nickname: pattern }] });
};

// Reads a finished match's liveMatchData (batting/bowling cards per innings) and
// folds each AKP THUNDERz player's contribution into their Player.stats.
// Safe to call only once per match — the caller is responsible for the
// Match.statsApplied guard.
async function applyMatchStatsToPlayers(liveMatchData) {
  if (!liveMatchData?.innings?.length) return;

  const touchedIds = new Set();

  for (const inn of liveMatchData.innings) {
    if (isOurTeam(inn.battingTeam)) {
      for (const entry of inn.battingCard || []) {
        const player = await findLinkedPlayerByName(entry.name);
        if (!player) continue;
        player.stats.runs += entry.runs || 0;
        player.stats.ballsFaced += entry.balls || 0;
        if (entry.out) player.stats.timesOut += 1;
        await player.save();
        touchedIds.add(String(player._id));
      }
    }
    if (isOurTeam(inn.bowlingTeam)) {
      for (const entry of inn.bowlingCard || []) {
        const player = await findLinkedPlayerByName(entry.name);
        if (!player) continue;
        player.stats.wickets += entry.wickets || 0;
        await player.save();
        touchedIds.add(String(player._id));
      }
    }
  }

  // One match played per player touched, then recompute derived stats
  for (const id of touchedIds) {
    const player = await Player.findById(id);
    if (!player) continue;
    player.stats.matchesPlayed += 1;
    player.stats.strikeRate = player.stats.ballsFaced
      ? Number(((player.stats.runs / player.stats.ballsFaced) * 100).toFixed(2))
      : 0;
    player.stats.average = player.stats.timesOut
      ? Number((player.stats.runs / player.stats.timesOut).toFixed(2))
      : player.stats.runs;
    await player.save();
  }

  return touchedIds.size;
}

module.exports = { applyMatchStatsToPlayers, isOurTeam };
