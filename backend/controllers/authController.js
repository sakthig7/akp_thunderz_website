const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Helper: sign token, set cookie, send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return next(new ErrorResponse('Email already registered', 400));

  const user = await User.create({ name, email, password, phone, role: 'user' });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user or admin
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Admin-only login (rejects non-admin accounts)
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !user.isActive) {
    return next(new ErrorResponse('Invalid admin credentials', 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid admin credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// @desc    Update profile (name, phone, avatar)
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const fields = {};
  ['name', 'phone', 'avatar'].forEach((f) => {
    if (req.body[f] !== undefined) fields[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password - generates reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('No account found with that email', 404));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // In production, email this URL to the user via a mail service (e.g. Nodemailer).
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset token generated',
    resetUrl // exposed here for local/dev testing since no email service is wired up
  });
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) return next(new ErrorResponse('Invalid or expired reset token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});
