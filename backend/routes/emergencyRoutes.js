const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  triggerEmergency,
  getEmergencyHistory,
  resolveEmergency
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/trigger', protect, triggerEmergency);
router.get('/history', protect, getEmergencyHistory);
router.post('/resolve/:id', protect, resolveEmergency);

module.exports = router;