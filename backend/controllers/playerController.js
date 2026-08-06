const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Player = require('../models/Player');

// @desc    Get all players (supports ?role=&search=&hasAccount=true&page=&limit=)
// @route   GET /api/players
// @access  Public
exports.getPlayers = asyncHandler(async (req, res) => {
  const { role, search, hasAccount, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };

  if (role) query.role = role;
  if (search) query.fullName = { $regex: search, $options: 'i' };
  // Used by the live-scoring admin UI to only offer players with a linked,
  // authenticated account — enforces "only account-created players can participate".
  if (hasAccount === 'true') query.user = { $ne: null };

  const skip = (Number(page) - 1) * Number(limit);
  const [players, total] = await Promise.all([
    Player.find(query).sort({ jerseyNumber: 1 }).skip(skip).limit(Number(limit)),
    Player.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: players.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: players
  });
});

// @desc    Get single player
// @route   GET /api/players/:id
// @access  Public
exports.getPlayer = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);
  if (!player) return next(new ErrorResponse('Player not found', 404));
  res.status(200).json({ success: true, data: player });
});

// An empty string from a multipart form should unset the link, not fail ObjectId casting
const sanitizeUserField = (body) => {
  if (body.user === '' || body.user === 'null' || body.user === undefined) delete body.user;
  return body;
};

// @desc    Create player
// @route   POST /api/players
// @access  Private/Admin
exports.createPlayer = asyncHandler(async (req, res) => {
  if (req.file) req.body.photo = `/uploads/players/${req.file.filename}`;
  const player = await Player.create(sanitizeUserField(req.body));
  res.status(201).json({ success: true, data: player });
});

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private/Admin
exports.updatePlayer = asyncHandler(async (req, res, next) => {
  if (req.file) req.body.photo = `/uploads/players/${req.file.filename}`;

  const player = await Player.findByIdAndUpdate(req.params.id, sanitizeUserField(req.body), {
    new: true,
    runValidators: true
  });
  if (!player) return next(new ErrorResponse('Player not found', 404));

  res.status(200).json({ success: true, data: player });
});

// @desc    Unlink or relink a player's user account (dedicated endpoint so the
//          simple ManagePlayers form doesn't need multipart juggling for this alone)
// @route   PUT /api/players/:id/link-account
// @access  Private/Admin
exports.linkAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const player = await Player.findByIdAndUpdate(
    req.params.id,
    { user: userId || null },
    { new: true, runValidators: true }
  );
  if (!player) return next(new ErrorResponse('Player not found', 404));
  res.status(200).json({ success: true, data: player });
});

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private/Admin
exports.deletePlayer = asyncHandler(async (req, res, next) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) return next(new ErrorResponse('Player not found', 404));
  res.status(200).json({ success: true, data: {} });
});
