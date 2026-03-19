const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'prescription',
      'lab_report',
      'discharge_summary',
      'vaccination',
      'insurance',
      'identification',
      'imaging',
      'other'
    ],
    default: 'other'
  },
  categoryCustom: {
    type: String,
    trim: true
  },
  storagePath: {
    type: String,
    required: true
  },
  publicId: {
    type: String
  },
  secureUrl: {
    type: String
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for search
medicalDocumentSchema.index({ userId: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);