const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
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
  vitalsType: {
    type: String,
    enum: ['bp', 'sugar', 'weight', 'pulse', 'temperature'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  abnormalFlag: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 200
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
vitalsSchema.index({ userId: 1, vitalsType: 1, timestamp: -1 });

module.exports = mongoose.model('Vitals', vitalsSchema);