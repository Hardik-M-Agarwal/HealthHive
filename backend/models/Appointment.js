const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  clinic: {
    type: String,
    required: [true, 'Clinic/Hospital name is required'],
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Appointment date and time is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for queries - only future appointments
appointmentSchema.index({ userId: 1, dateTime: 1 });
// Index for reminder cron job
appointmentSchema.index({ dateTime: 1, reminderSent: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);