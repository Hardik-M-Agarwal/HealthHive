const express = require('express');
const router = express.Router();
const { explainMedicine } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/gemini/explain - Explain a medicine
router.post('/explain', protect, explainMedicine);

module.exports = router;