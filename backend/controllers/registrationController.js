const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Registration = require('../models/Registration');

// @desc    Submit new member registration
// @route   POST /api/registrations
// @access  Public
exports.createRegistration = asyncHandler(async (req, res) => {
  if (req.file) req.body.photo = `/uploads/registrations/${req.file.filename}`;
  const registration = await Registration.create(req.body);
  res.status(201).json({ success: true, data: registration });
});

// @desc    Get all registrations (?status=Pending|Approved|Rejected)
// @route   GET /api/registrations
// @access  Private/Admin
exports.getRegistrations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [regs, total] = await Promise.all([
    Registration.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Registration.countDocuments(query)
  ]);

  res.status(200).json({ success: true, count: regs.length, total, data: regs });
});

// @desc    Get single registration
// @route   GET /api/registrations/:id
// @access  Private/Admin
exports.getRegistration = asyncHandler(async (req, res, next) => {
  const reg = await Registration.findById(req.params.id);
  if (!reg) return next(new ErrorResponse('Registration not found', 404));
  res.status(200).json({ success: true, data: reg });
});

// @desc    Approve or reject a registration
// @route   PUT /api/registrations/:id/status
// @access  Private/Admin
exports.updateRegistrationStatus = asyncHandler(async (req, res, next) => {
  const { status, reviewNote } = req.body;
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return next(new ErrorResponse('Invalid status value', 400));
  }

  const reg = await Registration.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, reviewedBy: req.user.id },
    { new: true, runValidators: true }
  );
  if (!reg) return next(new ErrorResponse('Registration not found', 404));

  res.status(200).json({ success: true, data: reg });
});

// @desc    Delete registration
// @route   DELETE /api/registrations/:id
// @access  Private/Admin
exports.deleteRegistration = asyncHandler(async (req, res, next) => {
  const reg = await Registration.findByIdAndDelete(req.params.id);
  if (!reg) return next(new ErrorResponse('Registration not found', 404));
  res.status(200).json({ success: true, data: {} });
});
