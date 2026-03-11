const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Complete onboarding - save health profile
// @route   POST /api/onboarding/complete
// @access  Private
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if health profile already exists
    const existingProfile = await HealthProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Health profile already exists' });
    }

    // Create health profile
    const healthProfile = await HealthProfile.create({
      userId,
      ...req.body
    });

    // Update user onboarding status
    await User.findByIdAndUpdate(userId, {
      onboardingCompleted: true
    });

    // Get the updated user
    const updatedUser = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'Onboarding completed successfully',
      healthProfile,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
        familyId: updatedUser.familyId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's health profile
// @route   GET /api/onboarding/profile
// @access  Private
const getHealthProfile = async (req, res) => {
  try {
    const healthProfile = await HealthProfile.findOne({ userId: req.user.id });
    
    if (!healthProfile) {
      return res.status(404).json({ message: 'Health profile not found' });
    }

    res.json({
      success: true,
      healthProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update health profile
// @route   PUT /api/onboarding/profile
// @access  Private
const updateHealthProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const healthProfile = await HealthProfile.findOneAndUpdate(
      { userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!healthProfile) {
      return res.status(404).json({ message: 'Health profile not found' });
    }

    res.json({
      success: true,
      healthProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check onboarding status
// @route   GET /api/onboarding/status
// @access  Private
const getOnboardingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const healthProfile = await HealthProfile.findOne({ userId: req.user.id });

    res.json({
      success: true,
      onboardingCompleted: user.onboardingCompleted,
      hasHealthProfile: !!healthProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  completeOnboarding,
  getHealthProfile,
  updateHealthProfile,
  getOnboardingStatus
};