const Family = require('../models/Family');
const User = require('../models/User');
const generateFamilyCode = require('../utils/generateFamilyCode');
const { validationResult } = require('express-validator');

// @desc    Create a family
// @route   POST /api/family/create
// @access  Private
const createFamily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { familyName } = req.body;
    const userId = req.user.id;

    // Generate unique family code
    let familyCode;
    let isUnique = false;
    
    while (!isUnique) {
      familyCode = generateFamilyCode();
      const existingFamily = await Family.findOne({ familyCode });
      if (!existingFamily) {
        isUnique = true;
      }
    }

    // Create family
    const family = await Family.create({
      familyName,
      familyCode,
      createdBy: userId,
      members: [userId]
    });

    // Update user with familyId and set as admin
    await User.findByIdAndUpdate(userId, {
      familyId: family._id,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      family: {
        id: family._id,
        familyName: family.familyName,
        familyCode: family.familyCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join a family
// @route   POST /api/family/join
// @access  Private
const joinFamily = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { familyCode } = req.body;
    const userId = req.user.id;

    // Find family by code
    const family = await Family.findOne({ familyCode });
    if (!family) {
      return res.status(404).json({ message: 'Invalid family code' });
    }

    // Check if user is already in a family
    const user = await User.findById(userId);
    if (user.familyId) {
      return res.status(400).json({ message: 'User already belongs to a family' });
    }

    // Add user to family members
    family.members.push(userId);
    await family.save();

    // Update user with familyId
    await User.findByIdAndUpdate(userId, {
      familyId: family._id,
      role: 'member'
    });

    res.json({
      success: true,
      family: {
        id: family._id,
        familyName: family.familyName,
        familyCode: family.familyCode
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get family details
// @route   GET /api/family/:familyId
// @access  Private
const getFamilyDetails = async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json({
      success: true,
      family
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get family members (for dropdown/filtering)
// @route   GET /api/family/members
// @access  Private
const getFamilyMembers = async (req, res) => {
  try {
    const family = await Family.findById(req.user.familyId)
      .populate('members', 'name email role');
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json({
      success: true,
      family: {
        id: family._id,
        familyName: family.familyName,
        members: family.members
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFamily,
  joinFamily,
  getFamilyDetails,
  getFamilyMembers
};