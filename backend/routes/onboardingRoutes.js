const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  completeOnboarding, 
  getHealthProfile, 
  updateHealthProfile,
  getOnboardingStatus 
} = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules for health profile
const healthProfileValidation = [
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('bloodGroup').notEmpty().withMessage('Blood group is required'),
  body('height').isNumeric().withMessage('Height must be a number'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('emergencyContacts').isArray().withMessage('Emergency contacts must be an array')
];

// Routes (all protected)
router.post('/complete', protect, healthProfileValidation, completeOnboarding);
router.get('/profile', protect, getHealthProfile);
router.put('/profile', protect, healthProfileValidation, updateHealthProfile);
router.get('/status', protect, getOnboardingStatus);

module.exports = router;