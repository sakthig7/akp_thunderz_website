const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes - verifies JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user || !req.user.isActive) {
      return next(new ErrorResponse('User no longer exists or is inactive', 401));
    }
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized, invalid token', 401));
  }
});

// Restrict to specific roles, e.g. authorize('admin')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Role '${req.user.role}' is not authorized for this action`, 403));
    }
    next();
  };
};
