const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Basic Info
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Please select blood group']
  },
  height: {
    type: Number,
    required: [true, 'Please provide height in cm']
  },
  weight: {
    type: Number,
    required: [true, 'Please provide weight in kg']
  },
  
  // Allergies
  allergies: [{
    type: String,
    trim: true
  }],
  
  // Past Diseases
  pastDiseases: [{
    disease: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['recovered', 'ongoing'],
      required: true
    }
  }],
  
  // Chronic Conditions
  chronicConditions: [{
    type: String,
    trim: true
  }],
  
  // Emergency Contacts
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  }],
  
  // Current Medications (for future use)
  currentMedications: [{
    medicine: String,
    dosage: String,
    frequency: String
  }],
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
healthProfileSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('HealthProfile', healthProfileSchema);