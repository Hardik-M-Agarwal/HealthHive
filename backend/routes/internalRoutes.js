const express = require('express');
const router  = express.Router();
const {
  getAllFamilies,
  getMemberVitals,
  getMemberMedications,
  getMemberProfile,
  generateHealthSummary
} = require('../controllers/internalController');

// ─── Internal API Key Middleware ──────────────────────────────────────────────
const internalAuth = (req, res, next) => {
  const apiKey = req.headers['x-internal-key'];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.get('/families',              internalAuth, getAllFamilies);
router.get('/vitals/:userId',        internalAuth, getMemberVitals);
router.get('/medications/:userId',   internalAuth, getMemberMedications);
router.get('/profile/:userId',       internalAuth, getMemberProfile);
router.post('/health-summary',       internalAuth, generateHealthSummary);

module.exports = router;