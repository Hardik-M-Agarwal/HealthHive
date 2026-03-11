const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  markAsTaken,
  getAnalytics,
  deleteMedication
} = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const medicationValidation = [
  body('medicineName').notEmpty().withMessage('Medicine name is required'),
  body('dosage.value').isNumeric().withMessage('Valid dosage value is required'),
  body('dosage.unit').notEmpty().withMessage('Dosage unit is required'),
  body('frequency.type').isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Valid frequency type is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
];

// Routes (all protected)
router.get('/analytics', protect, getAnalytics);
router.post('/', protect, medicationValidation, addMedication);
router.get('/', protect, getMedications);
router.get('/:id', protect, getMedicationById);
router.put('/:id', protect, medicationValidation, updateMedication);
router.delete('/:id', protect, deleteMedication);
router.post('/:id/taken', protect, markAsTaken);

module.exports = router;