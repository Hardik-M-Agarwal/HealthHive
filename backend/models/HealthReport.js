const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
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
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  simplifiedExplanation: {
    type: String,
    required: true
  },
  abnormalMarkers: [{
    marker: String,
    value: String,
    normalRange: String,
    interpretation: String
  }],
  reportDate: {
    type: Date,
    default: Date.now
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'pathology', 'other'],
    default: 'other'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthReport', healthReportSchema);