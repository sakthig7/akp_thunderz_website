// Ball-by-ball cricket scoring engine.
// Pure, immutable functions — every function returns a NEW innings/state object
// instead of mutating its input, so the admin UI can keep a simple undo stack
// of previous snapshots.
//
// Simplifications (documented, not bugs):
// - Every wicket is credited to the current bowler and attributed to the striker.
//   For run-outs where the non-striker is actually the one out, the admin should
//   pick "Swap Batsman" first so the correct player is on strike, then record the wicket.
// - Free-hit deliveries after a no-ball are not specially tracked (a wicket can
//   still be recorded manually if the admin judges it standed, e.g. run-out).

const emptyBatsman = (name) => ({ name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '' });
const emptyBowlerCard = (name) => ({ name, legalBalls: 0, runs: 0, wickets: 0, maidens: 0 });

export const createInnings = ({ battingTeam, bowlingTeam, striker, nonStriker, bowler, target = null }) => ({
  battingTeam,
  bowlingTeam,
  totalRuns: 0,
  totalWickets: 0,
  legalBalls: 0,
  extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
  target,
  striker: emptyBatsman(striker),
  nonStriker: emptyBatsman(nonStriker),
  currentBowler: emptyBowlerCard(bowler),
  currentOverRuns: 0,
  recentBalls: [],
  battingCard: [emptyBatsman(striker), emptyBatsman(nonStriker)],
  bowlingCard: [emptyBowlerCard(bowler)],
  isComplete: false,
  needsNewBowler: false,
  needsNewBatsman: false
});

const syncCard = (card, entry) => {
  const idx = card.findIndex((c) => c.name === entry.name);
  if (idx >= 0) card[idx] = { ...entry };
  else card.push({ ...entry });
};

// action: { runs, extra: 'wd'|'nb'|'b'|'lb'|null, wicket: bool, dismissal: string }
export function applyBall(prevInnings, action) {
  const inn = JSON.parse(JSON.stringify(prevInnings));
  const { runs = 0, extra = null, wicket = false, dismissal = '' } = action;
  const isWide = extra === 'wd';
  const isNoBall = extra === 'nb';
  const isBye = extra === 'b';
  const isLegBye = extra === 'lb';
  const legalDelivery = !isWide && !isNoBall;

  let runsToTeam = runs;
  let runsToBowler = runs;
  let runsToBatsman = 0;
  let ballLabel = String(runs);

  if (isWide) {
    runsToTeam = runs + 1;
    runsToBowler = runsToTeam;
    inn.extras.wides += runsToTeam;
    ballLabel = runs > 0 ? `${runsToTeam}wd` : 'Wd';
  } else if (isNoBall) {
    runsToTeam = runs + 1;
    runsToBowler = runsToTeam;
    runsToBatsman = runs;
    inn.extras.noBalls += 1;
    ballLabel = runs > 0 ? `${runs}nb` : 'Nb';
  } else if (isBye) {
    runsToBowler = 0;
    inn.extras.byes += runs;
    ballLabel = `${runs}b`;
  } else if (isLegBye) {
    runsToBowler = 0;
    inn.extras.legByes += runs;
    ballLabel = `${runs}lb`;
  } else {
    runsToBatsman = runs;
  }

  if (!isWide) inn.striker.balls += 1;
  if (runsToBatsman > 0) {
    inn.striker.runs += runsToBatsman;
    if (runsToBatsman === 4) inn.striker.fours += 1;
    if (runsToBatsman === 6) inn.striker.sixes += 1;
  }

  inn.totalRuns += runsToTeam;
  inn.currentOverRuns += runsToBowler;
  inn.currentBowler.runs += runsToBowler;
  if (legalDelivery) {
    inn.currentBowler.legalBalls += 1;
    inn.legalBalls += 1;
  }

  let wicketFell = false;
  if (wicket) {
    wicketFell = true;
    inn.totalWickets += 1;
    inn.currentBowler.wickets += 1;
    inn.striker.out = true;
    inn.striker.dismissal = dismissal || 'out';
    ballLabel = 'W';
  }

  const rotatingRuns = isWide ? 0 : (runsToBatsman || (isBye || isLegBye ? runs : 0));
  if (!wicket && rotatingRuns % 2 === 1) {
    const tmp = inn.striker; inn.striker = inn.nonStriker; inn.nonStriker = tmp;
  }

  inn.recentBalls = [...inn.recentBalls, ballLabel].slice(-12);

  syncCard(inn.battingCard, inn.striker);
  syncCard(inn.battingCard, inn.nonStriker);
  syncCard(inn.bowlingCard, inn.currentBowler);

  let overCompleted = false;
  if (legalDelivery && inn.legalBalls % 6 === 0) {
    overCompleted = true;
    if (inn.currentOverRuns === 0) inn.currentBowler.maidens += 1;
    syncCard(inn.bowlingCard, inn.currentBowler);
    inn.currentOverRuns = 0;
    const tmp = inn.striker; inn.striker = inn.nonStriker; inn.nonStriker = tmp;
    inn.needsNewBowler = true;
  }

  if (wicketFell) inn.needsNewBatsman = true;

  return { innings: inn, overCompleted, wicketFell };
}

export function setNewBowler(prevInnings, bowlerName) {
  const inn = JSON.parse(JSON.stringify(prevInnings));
  const existing = inn.bowlingCard.find((b) => b.name === bowlerName);
  inn.currentBowler = existing ? { ...existing } : emptyBowlerCard(bowlerName);
  inn.currentOverRuns = 0;
  inn.needsNewBowler = false;
  syncCard(inn.bowlingCard, inn.currentBowler);
  return inn;
}

export function setNewBatsman(prevInnings, batsmanName) {
  const inn = JSON.parse(JSON.stringify(prevInnings));
  inn.striker = emptyBatsman(batsmanName);
  inn.needsNewBatsman = false;
  syncCard(inn.battingCard, inn.striker);
  return inn;
}

export function swapBatsmen(prevInnings) {
  const inn = JSON.parse(JSON.stringify(prevInnings));
  const tmp = inn.striker; inn.striker = inn.nonStriker; inn.nonStriker = tmp;
  return inn;
}

export function oversLabel(legalBalls) {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return `${overs}.${balls}`;
}

export function runRate(totalRuns, legalBalls) {
  if (!legalBalls) return '0.00';
  return ((totalRuns / legalBalls) * 6).toFixed(2);
}

export function requiredRunRate(target, totalRuns, legalBalls, totalLegalBallsInInnings) {
  const ballsLeft = totalLegalBallsInInnings - legalBalls;
  const runsNeeded = target - totalRuns;
  if (ballsLeft <= 0 || runsNeeded <= 0) return '0.00';
  return ((runsNeeded / ballsLeft) * 6).toFixed(2);
}

export function startInnings2(liveMatchData, oversPerInnings, striker, nonStriker, bowler) {
  const inn1 = liveMatchData.innings[0];
  const inn2 = createInnings({
    battingTeam: inn1.bowlingTeam,
    bowlingTeam: inn1.battingTeam,
    striker,
    nonStriker,
    bowler,
    target: inn1.totalRuns + 1
  });
  return { ...liveMatchData, innings: [inn1, inn2], currentInnings: 2 };
}

// Matches the backend's AKP THUNDERz detection so the UI knows when to restrict
// name entry to linked, account-holding roster players vs. free-text (opponent).
export function isOurTeam(teamName) {
  return /thunderz/i.test(teamName || '');
}

export function computeFinalResult(liveMatchData, manOfTheMatch = '', summary = '') {
  const [inn1, inn2] = liveMatchData.innings;
  let winner = '';
  let scoreLine = `${inn1.battingTeam} ${inn1.totalRuns}/${inn1.totalWickets} (${oversLabel(inn1.legalBalls)} ov)`;
  if (inn2) {
    scoreLine += ` · ${inn2.battingTeam} ${inn2.totalRuns}/${inn2.totalWickets} (${oversLabel(inn2.legalBalls)} ov)`;
    if (inn2.totalRuns >= inn1.totalRuns + 1) {
      const wicketsInHand = 10 - inn2.totalWickets;
      winner = `${inn2.battingTeam} won by ${wicketsInHand} wicket${wicketsInHand === 1 ? '' : 's'}`;
    } else if (inn2.totalRuns < inn1.totalRuns) {
      const margin = inn1.totalRuns - inn2.totalRuns;
      winner = `${inn1.battingTeam} won by ${margin} run${margin === 1 ? '' : 's'}`;
    } else {
      winner = 'Match tied';
    }
  }
  return { winner, score: scoreLine, manOfTheMatch, summary };
}
