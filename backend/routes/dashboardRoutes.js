const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
