const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Gallery = require('../models/Gallery');

// @desc    Get gallery items (supports ?type=photo|video&page=&limit=)
// @route   GET /api/gallery
// @access  Public
exports.getGalleryItems = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 24 } = req.query;
  const query = {};
  if (type) query.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Gallery.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Gallery.countDocuments(query)
  ]);

  res.status(200).json({ success: true, count: items.length, total, data: items });
});

// @desc    Upload one or more photos/videos
// @route   POST /api/gallery
// @access  Private/Admin
exports.uploadGalleryItems = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one file', 400));
  }

  const docs = await Promise.all(
    req.files.map((file) => {
      const isVideo = file.mimetype.startsWith('video');
      return Gallery.create({
        title: req.body.title || file.originalname,
        type: isVideo ? 'video' : 'photo',
        url: `/uploads/gallery/${file.filename}`,
        uploadedBy: req.user.id
      });
    })
  );

  res.status(201).json({ success: true, count: docs.length, data: docs });
});

// @desc    Update gallery item (title/thumbnail)
// @route   PUT /api/gallery/:id
// @access  Private/Admin
exports.updateGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!item) return next(new ErrorResponse('Gallery item not found', 404));
  res.status(200).json({ success: true, data: item });
});

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteGalleryItem = asyncHandler(async (req, res, next) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) return next(new ErrorResponse('Gallery item not found', 404));
  res.status(200).json({ success: true, data: {} });
});
