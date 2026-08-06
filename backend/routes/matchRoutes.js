const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  updateLiveState,
  deleteMatch
} = require('../controllers/matchController');

router.get('/', getMatches);
router.get('/:id', getMatch);
router.post('/', protect, authorize('admin'), createMatch);
router.put('/:id', protect, authorize('admin'), updateMatch);
router.put('/:id/live-state', protect, authorize('admin'), updateLiveState);
router.delete('/:id', protect, authorize('admin'), deleteMatch);

module.exports = router;
