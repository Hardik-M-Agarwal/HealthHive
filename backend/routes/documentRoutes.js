const express = require('express');
const router = express.Router();
const upload = require('../middleware/documentUpload');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  serveDocument,
  toggleFavorite,
  updateCategory,
  deleteDocument
} = require('../controllers/medicalDocumentController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/', protect, upload, uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id/file', protect, serveDocument);
router.get('/:id', protect, getDocumentById);
router.put('/:id/favorite', protect, toggleFavorite);
router.put('/:id/category', protect, updateCategory);
router.delete('/:id', protect, deleteDocument);

module.exports = router;