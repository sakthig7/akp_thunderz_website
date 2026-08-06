const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const News = require('../models/News');

// @desc    Get all published news (?page=&limit=)
// @route   GET /api/news
// @access  Public
exports.getNews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [news, total] = await Promise.all([
    News.find({ isPublished: true }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('author', 'name'),
    News.countDocuments({ isPublished: true })
  ]);

  res.status(200).json({ success: true, count: news.length, total, data: news });
});

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getNewsArticle = asyncHandler(async (req, res, next) => {
  const article = await News.findById(req.params.id).populate('author', 'name');
  if (!article) return next(new ErrorResponse('News article not found', 404));
  res.status(200).json({ success: true, data: article });
});

// @desc    Create news article
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = asyncHandler(async (req, res) => {
  if (req.file) req.body.coverImage = `/uploads/news/${req.file.filename}`;
  req.body.author = req.user.id;
  const article = await News.create(req.body);
  res.status(201).json({ success: true, data: article });
});

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = asyncHandler(async (req, res, next) => {
  if (req.file) req.body.coverImage = `/uploads/news/${req.file.filename}`;
  const article = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!article) return next(new ErrorResponse('News article not found', 404));
  res.status(200).json({ success: true, data: article });
});

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = asyncHandler(async (req, res, next) => {
  const article = await News.findByIdAndDelete(req.params.id);
  if (!article) return next(new ErrorResponse('News article not found', 404));
  res.status(200).json({ success: true, data: {} });
});
