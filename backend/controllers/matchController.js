const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Match = require('../models/Match');
const { applyMatchStatsToPlayers } = require('../utils/applyMatchStats');

// @desc    Get all matches (supports ?status=Upcoming|Completed etc.)
// @route   GET /api/matches
// @access  Public
exports.getMatches = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [matches, total] = await Promise.all([
    Match.find(query).sort({ date: 1 }).skip(skip).limit(Number(limit)),
    Match.countDocuments(query)
  ]);

  res.status(200).json({ success: true, count: matches.length, total, data: matches });
});

// @desc    Get single match
// @route   GET /api/matches/:id
// @access  Public
exports.getMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findById(req.params.id);
  if (!match) return next(new ErrorResponse('Match not found', 404));
  res.status(200).json({ success: true, data: match });
});

// @desc    Create match
// @route   POST /api/matches
// @access  Private/Admin
exports.createMatch = asyncHandler(async (req, res) => {
  const match = await Match.create(req.body);
  res.status(201).json({ success: true, data: match });
});

// @desc    Update match (schedule details or result)
// @route   PUT /api/matches/:id
// @access  Private/Admin
exports.updateMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!match) return next(new ErrorResponse('Match not found', 404));
  res.status(200).json({ success: true, data: match });
});

// Builds a short headline like "AKP THUNDERz 145/4 (18.2 ov)" from the current innings
const buildHeadline = (liveMatchData) => {
  if (!liveMatchData?.innings?.length) return '';
  const inn = liveMatchData.innings[liveMatchData.currentInnings - 1];
  if (!inn) return '';
  const overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
  let headline = `${inn.battingTeam} ${inn.totalRuns}/${inn.totalWickets} (${overs.toFixed(1)} ov)`;
  if (inn.target) headline += ` — target ${inn.target}`;
  return headline;
};

// @desc    Start live scoring for a match (sets up teams/first innings/openers)
// @route   PUT /api/matches/:id/live-state
// @access  Private/Admin
// @desc    Push one ball-by-ball scoring snapshot (admin's scoring UI computes the
//          full state client-side and sends the whole liveMatchData blob each time)
exports.updateLiveState = asyncHandler(async (req, res, next) => {
  const { liveMatchData, status } = req.body;
  if (!liveMatchData) return next(new ErrorResponse('liveMatchData is required', 400));

  const match = await Match.findById(req.params.id);
  if (!match) return next(new ErrorResponse('Match not found', 404));

  match.liveMatchData = liveMatchData;
  match.status = status || 'Live';
  match.liveScore = { text: buildHeadline(liveMatchData), updatedAt: new Date() };

  // When the admin finalizes the match, mirror the result into the existing
  // result{} fields so the Completed-match views keep working unchanged.
  if (status === 'Completed' && liveMatchData.finalResult) {
    match.result = liveMatchData.finalResult;
  }

  await match.save();

  // Credit AKP THUNDERz players' career stats exactly once, the first time this
  // match is marked Completed with scoring data attached.
  let playersUpdated = 0;
  if (status === 'Completed' && !match.statsApplied && liveMatchData.innings?.length) {
    playersUpdated = (await applyMatchStatsToPlayers(liveMatchData)) || 0;
    match.statsApplied = true;
    await match.save();
  }

  res.status(200).json({ success: true, data: match, playersUpdated });
});

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private/Admin
exports.deleteMatch = asyncHandler(async (req, res, next) => {
  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) return next(new ErrorResponse('Match not found', 404));
  res.status(200).json({ success: true, data: {} });
});
