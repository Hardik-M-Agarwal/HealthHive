const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  familyName: {
    type: String,
    required: [true, 'Please provide a family name'],
    trim: true,
    maxlength: [50, 'Family name cannot be more than 50 characters']
  },
  familyCode: {
    type: String,
    required: true,
    unique: true,
    length: 8
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Family', familySchema);