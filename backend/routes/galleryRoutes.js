const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const uploadFactory = require('../middleware/upload');
const upload = uploadFactory('gallery');
const {
  getGalleryItems,
  uploadGalleryItems,
  updateGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');

router.get('/', getGalleryItems);
router.post('/', protect, authorize('admin'), upload.array('files', 10), uploadGalleryItems);
router.put('/:id', protect, authorize('admin'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
