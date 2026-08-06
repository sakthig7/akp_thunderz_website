const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const uploadFactory = require('../middleware/upload');
const upload = uploadFactory('players');
const {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  linkAccount,
  deletePlayer
} = require('../controllers/playerController');

router.get('/', getPlayers);
router.get('/:id', getPlayer);
router.post('/', protect, authorize('admin'), upload.single('photo'), createPlayer);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), updatePlayer);
router.put('/:id/link-account', protect, authorize('admin'), linkAccount);
router.delete('/:id', protect, authorize('admin'), deletePlayer);

module.exports = router;
