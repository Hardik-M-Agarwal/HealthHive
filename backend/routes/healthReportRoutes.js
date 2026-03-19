const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadHealthReport,
  getHealthReports,
  getHealthReportById,
  toggleArchive,
  deleteReport
} = require('../controllers/healthReportController');
const { protect } = require('../middleware/authMiddleware');

// Routes (all protected)
router.post('/upload', protect, upload.single('file'), uploadHealthReport);
router.get('/', protect, getHealthReports);
router.get('/:id', protect, getHealthReportById);
router.put('/:id/archive', protect, toggleArchive);
router.delete('/:id', protect, deleteReport);

module.exports = router;