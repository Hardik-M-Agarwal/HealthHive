const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
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
  medicineName: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  takenAt: {
    type: Date,
    default: Date.now
  },
  dosage: {
    value: Number,
    unit: String
  },
  status: {
    type: String,
    enum: ['taken', 'missed', 'skipped', 'late'],
    default: 'taken'
  },
  lateBy: {
    type: Number, // minutes late
    default: 0
  },
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for analytics
medicationLogSchema.index({ medicationId: 1, scheduledDate: -1 });
medicationLogSchema.index({ userId: 1, status: 1, scheduledDate: -1 });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);