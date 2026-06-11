const MedicalDocument = require('../models/MedicalDocument');
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('../config/cloudinary');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const familyId = req.user.familyId;
    const file = req.file;
    const { category, categoryCustom } = req.body;

    let fileType = 'other';
    if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype === 'application/pdf') fileType = 'pdf';

    let storagePath = file.path;
    let publicId = null;
    let secureUrl = null;

    // Images → Cloudinary (original working logic, untouched)
    if (fileType === 'image') {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'medical-documents',
          resource_type: 'image'
        });
        publicId = result.public_id;
        secureUrl = result.secure_url;
        storagePath = secureUrl;
        await fs.unlink(file.path).catch(err => console.warn('Could not delete temp file:', err));
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        // Keep local file as fallback
      }
    }

    // PDFs → stay on local server, served via /api/documents/:id/file

    const document = await MedicalDocument.create({
      userId,
      familyId,
      fileName: file.filename,
      originalName: file.originalname,
      fileType,
      category: category || 'other',
      categoryCustom: category === 'custom' ? categoryCustom : undefined,
      storagePath,
      publicId,
      secureUrl
    });

    res.status(201).json({ success: true, document });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, search, favorite } = req.query;

    const query = { userId };
    if (category) query.category = category;
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await MedicalDocument.find(query).sort({ createdAt: -1 });
    res.json({ success: true, documents });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    res.json({ success: true, document });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Serve PDF directly from local storage
// @route   GET /api/documents/:id/file
// @access  Private
const serveDocument = async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    // Images → redirect to Cloudinary URL
    if (document.secureUrl) {
      return res.redirect(document.secureUrl);
    }

    // PDFs → serve from local disk
    const filePath = path.resolve(document.storagePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle favorite
// @route   PUT /api/documents/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    document.isFavorite = !document.isFavorite;
    await document.save();
    res.json({ success: true, isFavorite: document.isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update document category
// @route   PUT /api/documents/:id/category
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { category, categoryCustom } = req.body;
    const document = await MedicalDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    document.category = category;
    document.categoryCustom = category === 'custom' ? categoryCustom : undefined;
    await document.save();
    res.json({ success: true, document });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await MedicalDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    // Delete from Cloudinary if image
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId);
    }

    // Delete local file for PDFs
    if (document.fileType === 'pdf' && document.storagePath) {
      await fs.unlink(document.storagePath).catch(err => console.warn('Could not delete local file:', err));
    }

    await document.deleteOne();
    res.json({ success: true, message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  serveDocument,
  toggleFavorite,
  updateCategory,
  deleteDocument
};