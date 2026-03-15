const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const appointmentValidation = [
  body('doctorName').notEmpty().withMessage('Doctor name is required'),
  body('clinic').notEmpty().withMessage('Clinic name is required'),
  body('dateTime').isISO8601().withMessage('Valid date and time is required')
];

// Routes (all protected) - User specific only
router.post('/', protect, appointmentValidation, createAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, appointmentValidation, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;