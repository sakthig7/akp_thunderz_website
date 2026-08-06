import React, { useState } from 'react';
import { oversLabel, runRate, requiredRunRate } from '../utils/scoringEngine';

const BallPill = ({ label }) => {
  const color =
    label === 'W' ? 'bg-red-500 text-white' :
    label === '4' ? 'bg-blue-500 text-white' :
    label === '6' ? 'bg-purple-500 text-white' :
    label.includes('wd') || label.includes('nb') ? 'bg-yellow-500 text-neutral-950' :
    'bg-neutral-700 text-neutral-200';
  return <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}>{label}</span>;
};

const LiveScoreboard = ({ liveMatchData, isLive = true, defaultTab = 'live' }) => {
  const [tab, setTab] = useState(defaultTab);
  if (!liveMatchData?.innings?.length) return null;

  const inn = liveMatchData.innings[liveMatchData.currentInnings - 1];
  const overLimit = liveMatchData.oversPerInnings;

  return (
    <div className="rounded-xl border border-red-500/40 bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between bg-red-500/10 px-4 py-2">
        {isLive ? (
          <span className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> LIVE
          </span>
        ) : (
          <span className="text-sm font-semibold text-gold">Full Scorecard</span>
        )}
        <div className="flex gap-2 text-xs">
          {isLive && <button onClick={() => setTab('live')} className={`rounded-full px-3 py-1 ${tab === 'live' ? 'bg-gold text-neutral-950' : 'text-neutral-400'}`}>Live</button>}
          <button onClick={() => setTab('scorecard')} className={`rounded-full px-3 py-1 ${tab === 'scorecard' ? 'bg-gold text-neutral-950' : 'text-neutral-400'}`}>Scorecard</button>
        </div>
      </div>

      {tab === 'live' ? (
        <div className="p-4">
          <p className="font-display text-2xl text-white">
            {inn.battingTeam} <span className="text-gold">{inn.totalRuns}/{inn.totalWickets}</span>
            <span className="ml-2 text-base text-neutral-400">({oversLabel(inn.legalBalls)} ov)</span>
          </p>
          <p className="text-sm text-neutral-500">
            CRR {runRate(inn.totalRuns, inn.legalBalls)}
            {inn.target && overLimit && (
              <> &middot; Need {Math.max(inn.target - inn.totalRuns, 0)} runs &middot; RRR {requiredRunRate(inn.target, inn.totalRuns, inn.legalBalls, overLimit * 6)}</>
            )}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-md bg-neutral-800/70 p-3">
              <p className="mb-1 text-xs uppercase text-neutral-500">Batting</p>
              <p className="flex justify-between text-white">
                <span>{inn.striker.name} *</span>
                <span>{inn.striker.runs} ({inn.striker.balls})</span>
              </p>
              <p className="flex justify-between text-neutral-400">
                <span>{inn.nonStriker.name}</span>
                <span>{inn.nonStriker.runs} ({inn.nonStriker.balls})</span>
              </p>
            </div>
            <div className="rounded-md bg-neutral-800/70 p-3">
              <p className="mb-1 text-xs uppercase text-neutral-500">Bowling</p>
              <p className="flex justify-between text-white">
                <span>{inn.currentBowler.name}</span>
                <span>{inn.currentBowler.wickets}/{inn.currentBowler.runs} ({oversLabel(inn.currentBowler.legalBalls)})</span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase text-neutral-500">This Over</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {inn.recentBalls.length === 0 && <span className="text-sm text-neutral-600">Yet to start</span>}
              {inn.recentBalls.map((b, i) => <BallPill key={i} label={b} />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 p-4">
          {liveMatchData.innings.map((innData, idx) => (
            <div key={idx}>
              <h4 className="mb-2 font-display text-lg text-gold">
                {innData.battingTeam} {innData.totalRuns}/{innData.totalWickets} ({oversLabel(innData.legalBalls)} ov)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-500">
                      <th className="py-1 pr-2">Batter</th>
                      <th className="py-1 pr-2">R</th>
                      <th className="py-1 pr-2">B</th>
                      <th className="py-1 pr-2">4s</th>
                      <th className="py-1 pr-2">6s</th>
                      <th className="py-1">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innData.battingCard.map((b, i) => (
                      <tr key={i} className="border-t border-neutral-800 text-neutral-300">
                        <td className="py-1 pr-2">{b.name}{b.out ? '' : ' *'}<div className="text-[10px] text-neutral-500">{b.out ? b.dismissal : 'not out'}</div></td>
                        <td className="py-1 pr-2 font-semibold text-white">{b.runs}</td>
                        <td className="py-1 pr-2">{b.balls}</td>
                        <td className="py-1 pr-2">{b.fours}</td>
                        <td className="py-1 pr-2">{b.sixes}</td>
                        <td className="py-1">{b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs text-neutral-500">
                  Extras: {innData.extras.wides + innData.extras.noBalls + innData.extras.byes + innData.extras.legByes}
                  {' '}(wd {innData.extras.wides}, nb {innData.extras.noBalls}, b {innData.extras.byes}, lb {innData.extras.legByes})
                </p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead>
                    <tr className="text-neutral-500">
                      <th className="py-1 pr-2">Bowler</th>
                      <th className="py-1 pr-2">O</th>
                      <th className="py-1 pr-2">M</th>
                      <th className="py-1 pr-2">R</th>
                      <th className="py-1 pr-2">W</th>
                      <th className="py-1">Econ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innData.bowlingCard.map((b, i) => (
                      <tr key={i} className="border-t border-neutral-800 text-neutral-300">
                        <td className="py-1 pr-2">{b.name}</td>
                        <td className="py-1 pr-2">{oversLabel(b.legalBalls)}</td>
                        <td className="py-1 pr-2">{b.maidens}</td>
                        <td className="py-1 pr-2">{b.runs}</td>
                        <td className="py-1 pr-2 font-semibold text-white">{b.wickets}</td>
                        <td className="py-1">{runRate(b.runs, b.legalBalls)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;
