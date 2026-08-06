import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Undo2, Repeat, Flag, Trophy } from 'lucide-react';
import { getMatch, updateLiveState } from '../../services/matchService';
import { getPlayers } from '../../services/playerService';
import {
  createInnings, applyBall, setNewBowler, setNewBatsman, swapBatsmen,
  oversLabel, runRate, startInnings2, computeFinalResult, isOurTeam
} from '../../utils/scoringEngine';
import Modal from '../../components/Modal';
import PlayerNameField from '../../components/PlayerNameField';
import Spinner from '../../components/Spinner';

const OVERS_BY_TYPE = { T20: 20, ODI: 50, Test: 90, Friendly: 20, Tournament: 20 };

const LiveScoring = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [linkedPlayers, setLinkedPlayers] = useState([]);

  useEffect(() => {
    getPlayers({ hasAccount: 'true', limit: 200 }).then(({ data }) => setLinkedPlayers(data.data)).catch(() => {});
  }, []);

  // Setup form (before scoring starts)
  const [setupForm, setSetupForm] = useState({
    teamA: 'AKP THUNDERz', teamB: '', oversPerInnings: 20,
    striker: '', nonStriker: '', bowler: ''
  });

  // Extra-run sub-panel (wide / no-ball / bye / leg-bye)
  const [extraType, setExtraType] = useState(null);
  // Wicket modal
  const [wicketOpen, setWicketOpen] = useState(false);
  const [dismissal, setDismissal] = useState('');
  const [newBatsmanAfterWicket, setNewBatsmanAfterWicket] = useState('');
  // New bowler prompt (after over completes)
  const [bowlerPrompt, setBowlerPrompt] = useState('');
  // New innings setup
  const [inningsModalOpen, setInningsModalOpen] = useState(false);
  const [inn2Form, setInn2Form] = useState({ striker: '', nonStriker: '', bowler: '' });
  // Finish match modal
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishForm, setFinishForm] = useState({ manOfTheMatch: '', summary: '' });

  useEffect(() => {
    getMatch(id).then(({ data }) => {
      setMatch(data.data);
      if (data.data.liveMatchData) {
        setLiveData(data.data.liveMatchData);
        setSetupForm((f) => ({ ...f, teamB: data.data.opponent, oversPerInnings: OVERS_BY_TYPE[data.data.matchType] || 20 }));
      } else {
        setSetupForm((f) => ({ ...f, teamB: data.data.opponent, oversPerInnings: OVERS_BY_TYPE[data.data.matchType] || 20 }));
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const persist = async (nextLiveData, status = 'Live') => {
    setSaving(true);
    try {
      await updateLiveState(id, nextLiveData, status);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save — check connection and try again');
    } finally {
      setSaving(false);
    }
  };

  const pushUpdate = (nextLiveData, status) => {
    setHistory((h) => [...h, liveData].slice(-30));
    setLiveData(nextLiveData);
    persist(nextLiveData, status);
  };

  const currentInnings = () => (liveData ? liveData.innings[liveData.currentInnings - 1] : null);

  const updateCurrentInnings = (newInn, status) => {
    const innings = [...liveData.innings];
    innings[liveData.currentInnings - 1] = newInn;
    pushUpdate({ ...liveData, innings }, status);
  };

  // ---- Setup ----
  const handleStartMatch = (e) => {
    e.preventDefault();
    if (!setupForm.teamB || !setupForm.striker || !setupForm.nonStriker || !setupForm.bowler) {
      return toast.error('Fill in both team names, opening batsmen, and opening bowler');
    }
    const inn1 = createInnings({
      battingTeam: setupForm.teamA, bowlingTeam: setupForm.teamB,
      striker: setupForm.striker, nonStriker: setupForm.nonStriker, bowler: setupForm.bowler
    });
    const initial = {
      teamA: setupForm.teamA, teamB: setupForm.teamB,
      oversPerInnings: Number(setupForm.oversPerInnings),
      currentInnings: 1, innings: [inn1], matchComplete: false, finalResult: null
    };
    setHistory([]);
    setLiveData(initial);
    persist(initial, 'Live');
    toast.success('Match started — good luck!');
  };

  // ---- Ball recording ----
  const recordBall = (action) => {
    const inn = currentInnings();
    if (inn.needsNewBowler || inn.needsNewBatsman || inn.isComplete) return;
    const { innings: newInn, overCompleted, wicketFell } = applyBall(inn, action);
    updateCurrentInnings(newInn);
    if (overCompleted) toast('Over complete — select the next bowler', { icon: '🎯' });
    if (wicketFell) toast('Wicket!', { icon: '🏏' });
  };

  const handleRun = (runs) => { setExtraType(null); recordBall({ runs }); };
  const handleExtraRuns = (runs) => {
    recordBall({ runs, extra: extraType });
    setExtraType(null);
  };
  const openWicket = () => { setDismissal(''); setNewBatsmanAfterWicket(''); setWicketOpen(true); };
  const confirmWicket = (e) => {
    e.preventDefault();
    if (!newBatsmanAfterWicket.trim()) return toast.error('Enter the incoming batsman\'s name');
    const inn = currentInnings();
    const { innings: afterWicket } = applyBall(inn, { runs: 0, wicket: true, dismissal: dismissal || 'out' });
    const afterNewBatsman = setNewBatsman(afterWicket, newBatsmanAfterWicket.trim());
    updateCurrentInnings(afterNewBatsman);
    setWicketOpen(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return toast.error('Nothing to undo');
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setLiveData(prev);
    persist(prev, 'Live');
    toast.success('Last ball undone');
  };

  const handleSwap = () => updateCurrentInnings(swapBatsmen(currentInnings()));

  const confirmNewBowler = (e) => {
    e.preventDefault();
    if (!bowlerPrompt.trim()) return toast.error("Enter the next bowler's name");
    updateCurrentInnings(setNewBowler(currentInnings(), bowlerPrompt.trim()));
    setBowlerPrompt('');
  };

  // ---- Innings / match management ----
  const openInningsSetup = () => {
    setInn2Form({ striker: '', nonStriker: '', bowler: '' });
    setInningsModalOpen(true);
  };
  const confirmStartInnings2 = (e) => {
    e.preventDefault();
    if (!inn2Form.striker || !inn2Form.nonStriker || !inn2Form.bowler) return toast.error('Fill in both openers and the bowler');
    const next = startInnings2(liveData, liveData.oversPerInnings, inn2Form.striker, inn2Form.nonStriker, inn2Form.bowler);
    setHistory((h) => [...h, liveData].slice(-30));
    setLiveData(next);
    persist(next, 'Live');
    setInningsModalOpen(false);
    toast.success('Second innings started');
  };

  const openFinish = () => { setFinishForm({ manOfTheMatch: '', summary: '' }); setFinishOpen(true); };
  const confirmFinish = (e) => {
    e.preventDefault();
    const finalResult = computeFinalResult(liveData, finishForm.manOfTheMatch, finishForm.summary);
    const next = { ...liveData, matchComplete: true, finalResult };
    setLiveData(next);
    persist(next, 'Completed');
    setFinishOpen(false);
    toast.success('Match finalized!');
  };

  if (loading) return <Spinner full />;
  if (!match) return <p className="text-neutral-500">Match not found.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/matches" className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold">
        <ArrowLeft size={16} /> Back to Matches
      </Link>
      <h1 className="section-title">Live Scoring &middot; vs {match.opponent}</h1>
      {saving && <p className="text-xs text-gold">Saving...</p>}

      {!liveData ? (
        <form onSubmit={handleStartMatch} className="card mt-6 space-y-4">
          <h2 className="font-display text-xl text-gold">Match Setup</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Team A (batting first)</label><input required className="input" value={setupForm.teamA} onChange={(e) => setSetupForm({ ...setupForm, teamA: e.target.value })} /></div>
            <div><label className="label">Team B</label><input required className="input" value={setupForm.teamB} onChange={(e) => setSetupForm({ ...setupForm, teamB: e.target.value })} /></div>
            <div><label className="label">Overs per Innings</label><input required type="number" className="input" value={setupForm.oversPerInnings} onChange={(e) => setSetupForm({ ...setupForm, oversPerInnings: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 border-t border-neutral-800 pt-4">
            <PlayerNameField label="Opening Striker" isAkp={isOurTeam(setupForm.teamA)} players={linkedPlayers} value={setupForm.striker} onChange={(v) => setSetupForm({ ...setupForm, striker: v })} />
            <PlayerNameField label="Opening Non-Striker" isAkp={isOurTeam(setupForm.teamA)} players={linkedPlayers} value={setupForm.nonStriker} onChange={(v) => setSetupForm({ ...setupForm, nonStriker: v })} />
            <PlayerNameField label="Opening Bowler" isAkp={isOurTeam(setupForm.teamB)} players={linkedPlayers} value={setupForm.bowler} onChange={(v) => setSetupForm({ ...setupForm, bowler: v })} />
          </div>
          <button className="btn-primary w-full">Start Match</button>
        </form>
      ) : liveData.matchComplete ? (
        <div className="card mt-6 text-center">
          <Trophy className="mx-auto mb-2 text-gold" size={32} />
          <h2 className="font-display text-2xl text-gold">{liveData.finalResult?.winner}</h2>
          <p className="mt-2 text-neutral-400">{liveData.finalResult?.score}</p>
          {liveData.finalResult?.manOfTheMatch && <p className="mt-2 text-sm text-neutral-500">MoM: {liveData.finalResult.manOfTheMatch}</p>}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Scoreboard header */}
          {(() => {
            const inn = currentInnings();
            return (
              <div className="card">
                <p className="font-display text-2xl text-white">
                  {inn.battingTeam} <span className="text-gold">{inn.totalRuns}/{inn.totalWickets}</span>
                  <span className="ml-2 text-base text-neutral-400">({oversLabel(inn.legalBalls)} ov)</span>
                </p>
                <p className="text-sm text-neutral-500">
                  CRR {runRate(inn.totalRuns, inn.legalBalls)}
                  {inn.target && <> &middot; Target {inn.target}</>}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-neutral-800/70 p-2">
                    <p className="flex justify-between text-white">{inn.striker.name} * <span>{inn.striker.runs} ({inn.striker.balls})</span></p>
                    <p className="flex justify-between text-neutral-400">{inn.nonStriker.name} <span>{inn.nonStriker.runs} ({inn.nonStriker.balls})</span></p>
                  </div>
                  <div className="rounded-md bg-neutral-800/70 p-2">
                    <p className="flex justify-between text-white">{inn.currentBowler.name} <span>{inn.currentBowler.wickets}/{inn.currentBowler.runs} ({oversLabel(inn.currentBowler.legalBalls)})</span></p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5 overflow-x-auto">
                  {inn.recentBalls.map((b, i) => <span key={i} className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-300">{b}</span>)}
                </div>
              </div>
            );
          })()}

          {/* Needs new bowler */}
          {currentInnings().needsNewBowler && (
            <form onSubmit={confirmNewBowler} className="card space-y-3 border-gold">
              <p className="text-sm text-gold">Over complete — who's bowling next?</p>
              <PlayerNameField isAkp={isOurTeam(currentInnings().bowlingTeam)} players={linkedPlayers} value={bowlerPrompt} onChange={setBowlerPrompt} autoFocus />
              <button className="btn-primary w-full">Confirm Bowler</button>
            </form>
          )}

          {/* Scoring pad */}
          {!currentInnings().needsNewBowler && !currentInnings().needsNewBatsman && (
            <div className="card">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map((r) => (
                  <button key={r} onClick={() => handleRun(r)} className="btn-secondary py-3 text-lg font-bold">{r}</button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button onClick={() => setExtraType('wd')} className="rounded-md bg-yellow-500/20 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/30">Wide</button>
                <button onClick={() => setExtraType('nb')} className="rounded-md bg-yellow-500/20 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/30">No Ball</button>
                <button onClick={() => setExtraType('b')} className="rounded-md bg-neutral-700 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-600">Bye</button>
                <button onClick={() => setExtraType('lb')} className="rounded-md bg-neutral-700 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-600">Leg Bye</button>
              </div>
              <button onClick={openWicket} className="btn-danger mt-3 w-full">WICKET</button>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
                <button onClick={handleUndo} className="btn-secondary text-sm"><Undo2 size={16} /> Undo Last Ball</button>
                <button onClick={handleSwap} className="btn-secondary text-sm"><Repeat size={16} /> Swap Batsmen</button>
                {liveData.currentInnings === 1 ? (
                  <button onClick={openInningsSetup} className="btn-secondary text-sm"><Flag size={16} /> End Innings</button>
                ) : (
                  <button onClick={openFinish} className="btn-primary text-sm"><Trophy size={16} /> Finish Match</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extra-runs sub-panel */}
      <Modal open={!!extraType} onClose={() => setExtraType(null)} title={{ wd: 'Wide', nb: 'No Ball', b: 'Bye', lb: 'Leg Bye' }[extraType]}>
        <p className="mb-4 text-sm text-neutral-400">How many runs on this delivery?</p>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((r) => (
            <button key={r} onClick={() => handleExtraRuns(r)} className="btn-secondary py-3 font-bold">{r}</button>
          ))}
        </div>
      </Modal>

      {/* Wicket modal */}
      <Modal open={wicketOpen} onClose={() => setWicketOpen(false)} title="Wicket">
        <form onSubmit={confirmWicket} className="space-y-4">
          <div>
            <label className="label">Dismissal Type</label>
            <select className="input" value={dismissal} onChange={(e) => setDismissal(e.target.value)}>
              <option value="">Select...</option>
              <option>Bowled</option><option>Caught</option><option>LBW</option>
              <option>Run Out</option><option>Stumped</option><option>Hit Wicket</option>
            </select>
          </div>
          <PlayerNameField label="Incoming Batsman" isAkp={isOurTeam(currentInnings()?.battingTeam)} players={linkedPlayers} value={newBatsmanAfterWicket} onChange={setNewBatsmanAfterWicket} autoFocus />
          <button className="btn-danger w-full">Confirm Wicket</button>
        </form>
      </Modal>

      {/* Start 2nd innings modal */}
      <Modal open={inningsModalOpen} onClose={() => setInningsModalOpen(false)} title="Start 2nd Innings">
        <form onSubmit={confirmStartInnings2} className="space-y-4">
          <p className="text-sm text-neutral-400">
            {liveData?.innings?.[0]?.bowlingTeam} need {liveData?.innings?.[0]?.totalRuns + 1} runs to win.
          </p>
          <PlayerNameField label="Opening Striker" isAkp={isOurTeam(liveData?.innings?.[0]?.bowlingTeam)} players={linkedPlayers} value={inn2Form.striker} onChange={(v) => setInn2Form({ ...inn2Form, striker: v })} />
          <PlayerNameField label="Opening Non-Striker" isAkp={isOurTeam(liveData?.innings?.[0]?.bowlingTeam)} players={linkedPlayers} value={inn2Form.nonStriker} onChange={(v) => setInn2Form({ ...inn2Form, nonStriker: v })} />
          <PlayerNameField label="Opening Bowler" isAkp={isOurTeam(liveData?.innings?.[0]?.battingTeam)} players={linkedPlayers} value={inn2Form.bowler} onChange={(v) => setInn2Form({ ...inn2Form, bowler: v })} />
          <button className="btn-primary w-full">Start Innings</button>
        </form>
      </Modal>

      {/* Finish match modal */}
      <Modal open={finishOpen} onClose={() => setFinishOpen(false)} title="Finish Match">
        <form onSubmit={confirmFinish} className="space-y-4">
          <div><label className="label">Man of the Match</label><input className="input" value={finishForm.manOfTheMatch} onChange={(e) => setFinishForm({ ...finishForm, manOfTheMatch: e.target.value })} /></div>
          <div><label className="label">Summary</label><textarea rows="3" className="input" value={finishForm.summary} onChange={(e) => setFinishForm({ ...finishForm, summary: e.target.value })} /></div>
          <button className="btn-primary w-full">Finalize Result</button>
        </form>
      </Modal>
    </div>
  );
};

export default LiveScoring;
