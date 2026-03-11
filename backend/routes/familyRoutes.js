const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createFamily, joinFamily, getFamilyDetails, getFamilyMembers } = require('../controllers/familyController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const createFamilyValidation = [
  body('familyName').notEmpty().withMessage('Family name is required')
];

const joinFamilyValidation = [
  body('familyCode')
    .notEmpty().withMessage('Family code is required')
    .isLength({ min: 8, max: 8 }).withMessage('Family code must be 8 characters')
];

// IMPORTANT: Specific routes must come BEFORE dynamic routes
router.get('/members', protect, getFamilyMembers); // Move this BEFORE /:familyId
router.post('/create', protect, createFamilyValidation, createFamily);
router.post('/join', protect, joinFamilyValidation, joinFamily);
router.get('/:familyId', protect, getFamilyDetails); // Dynamic route comes LAST

module.exports = router;