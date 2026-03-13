const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication'
  }],
  scheduledTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReminderLog', reminderLogSchema);