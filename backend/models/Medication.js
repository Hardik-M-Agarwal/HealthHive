const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
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
    required: [true, 'Medicine name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['prescription', 'over-the-counter', 'supplement', 'herbal', 'other'],
    default: 'prescription'
  },
  dosage: {
    value: {
      type: Number,
      required: [true, 'Dosage value is required']
    },
    unit: {
      type: String,
      enum: ['mg', 'g', 'mcg', 'ml', 'tablet', 'capsule', 'drop', 'puff', 'unit'],
      required: [true, 'Dosage unit is required']
    }
  },
  frequency: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      required: true
    },
    timesPerDay: {
      type: Number,
      min: 1,
      max: 24,
      default: 1
    },
    interval: {
      type: Number,
      min: 1
    }
  },
  schedule: [{
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    dosage: {
      value: Number,
      unit: String
    },
    taken: {
      type: Boolean,
      default: false
    },
    takenAt: Date
  }],
  timeOfDay: [{
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night']
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

medicationSchema.index({ userId: 1, familyId: 1, isActive: 1 });
medicationSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Medication', medicationSchema);