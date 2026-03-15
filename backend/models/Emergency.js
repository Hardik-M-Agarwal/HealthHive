const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
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
  emergencyType: {
    type: String,
    enum: ['medical', 'fire', 'accident', 'security', 'other'],
    default: 'other'
  },
  customMessage: {
    type: String,
    maxlength: [200, 'Message cannot exceed 200 characters']
  },
  location: {
    lat: Number,
    lng: Number,
    locationLink: String,
    address: String
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  notifiedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Emergency', emergencySchema);