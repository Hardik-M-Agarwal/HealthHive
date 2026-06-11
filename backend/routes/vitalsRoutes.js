const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addVitals,
  getMyVitals,
  getMyChartData,
  getFamilyVitals,
  analyzeMyTrend
} = require('../controllers/vitalsController');
const { protect } = require('../middleware/authMiddleware');

const vitalsValidation = [
  body('vitalsType').isIn(['bp', 'sugar', 'weight', 'pulse', 'temperature']).withMessage('Valid vitals type is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('unit').notEmpty().withMessage('Unit is required')
];

router.post('/', protect, vitalsValidation, addVitals);
router.get('/my-vitals', protect, getMyVitals);
router.get('/my-chart', protect, getMyChartData);
router.get('/family', protect, getFamilyVitals);
router.post('/analyze-my-trend', protect, analyzeMyTrend);

module.exports = router;