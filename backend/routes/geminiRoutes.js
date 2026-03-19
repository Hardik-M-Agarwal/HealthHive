const express = require('express');
const router = express.Router();
const { 
  explainMedicine, 
  explainMedicines 
} = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Much looser rate limiting for Gemini endpoints
const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute (much higher)
  message: { 
    success: false, 
    message: 'Too many requests, please try again later.' 
  },
  skip: (req) => {
    // Skip rate limiting for certain conditions if needed
    return false;
  }
});

// Looser limit for batch operations
const batchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 batch requests per minute
  message: { 
    success: false, 
    message: 'Too many batch requests, please try again later.' 
  }
});

// POST /api/gemini/explain - Explain a single medicine
router.post('/explain', protect, explainMedicine); // Removed rate limiter entirely

// POST /api/gemini/explain-many - Explain multiple medicines
router.post('/explain-many', protect, explainMedicines); // Removed rate limiter

module.exports = router;