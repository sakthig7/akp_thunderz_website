const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const uploadFactory = require('../middleware/upload');
const upload = uploadFactory('news');
const { getNews, getNewsArticle, createNews, updateNews, deleteNews } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/:id', getNewsArticle);
router.post('/', protect, authorize('admin'), upload.single('coverImage'), createNews);
router.put('/:id', protect, authorize('admin'), upload.single('coverImage'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);

module.exports = router;
