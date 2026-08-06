const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Contact = require('../models/Contact');

// @desc    Submit a contact message
// @route   POST /api/contacts
// @access  Public
exports.createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json({ success: true, data: contact });
});

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: contacts.length, data: contacts });
});

// @desc    Mark message read / update
// @route   PUT /api/contacts/:id
// @access  Private/Admin
exports.updateContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!contact) return next(new ErrorResponse('Message not found', 404));
  res.status(200).json({ success: true, data: contact });
});

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContact = asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return next(new ErrorResponse('Message not found', 404));
  res.status(200).json({ success: true, data: {} });
});
