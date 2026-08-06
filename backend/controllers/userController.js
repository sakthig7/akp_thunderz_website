const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// @desc    Get all users (?role=&search=&page=&limit=)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);

  res.status(200).json({ success: true, count: users.length, total, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Create a user (e.g. another admin) directly from the admin panel
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

// @desc    Update a user (role, isActive, profile fields)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: {} });
});
