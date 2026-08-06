const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const uploadFactory = require('../middleware/upload');
const upload = uploadFactory('registrations');
const {
  createRegistration,
  getRegistrations,
  getRegistration,
  updateRegistrationStatus,
  deleteRegistration
} = require('../controllers/registrationController');

router.post('/', upload.single('photo'), createRegistration);
router.get('/', protect, authorize('admin'), getRegistrations);
router.get('/:id', protect, authorize('admin'), getRegistration);
router.put('/:id/status', protect, authorize('admin'), updateRegistrationStatus);
router.delete('/:id', protect, authorize('admin'), deleteRegistration);

module.exports = router;
