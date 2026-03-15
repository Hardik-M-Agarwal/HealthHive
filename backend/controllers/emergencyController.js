const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Family = require('../models/Family');
const axios = require('axios');

// @desc    Trigger emergency alert
// @route   POST /api/emergency/trigger
// @access  Private
const triggerEmergency = async (req, res) => {
    try {
        const { emergencyType, customMessage, location } = req.body;
        const userId = req.user.id;
        const familyId = req.user.familyId;

        // Get user details
        const user = await User.findById(userId);

        // Get all family members
        const family = await Family.findById(familyId).populate('members', 'name phoneNumber');

        // Create emergency record
        const emergency = await Emergency.create({
            userId,
            familyId,
            emergencyType: emergencyType || 'other',
            customMessage: customMessage || '',
            location,
            status: 'active'
        });

        // Send alerts to all family members
        const alertResults = await sendEmergencyAlerts(user, family.members, emergency);

        // Update notified members
        emergency.notifiedMembers = alertResults.successful;
        await emergency.save();

        res.status(201).json({
            success: true,
            emergency,
            alerts: alertResults
        });

    } catch (error) {
        console.error('Emergency trigger error:', error);
        res.status(500).json({ message: 'Failed to send emergency alert' });
    }
};

// @desc    Get emergency history
// @route   GET /api/emergency/history
// @access  Private
const getEmergencyHistory = async (req, res) => {
    try {
        const { familyId } = req.user;

        const emergencies = await Emergency.find({ familyId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            emergencies
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resolve emergency
// @route   POST /api/emergency/resolve/:id
// @access  Private
const resolveEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findById(req.params.id);

        if (!emergency) {
            return res.status(404).json({ message: 'Emergency not found' });
        }

        emergency.status = 'resolved';
        await emergency.save();

        res.json({
            success: true,
            message: 'Emergency resolved'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to send alerts via Circuit Digest API
async function sendEmergencyAlerts(alertUser, familyMembers, emergency) {
  const results = {
    successful: [],
    failed: []
  };

  // 1️⃣ Prepare message text safely
  const emergencyTypeDisplay = {
    'medical': 'MEDICAL EMERGENCY',
    'fire': 'FIRE EMERGENCY',
    'accident': 'ACCIDENT',
    'security': 'SECURITY ALERT',
    'other': 'EMERGENCY'
  }[emergency.emergencyType] || 'EMERGENCY';

  // var1: short alert info
  const var1 = `${emergencyTypeDisplay} - ${alertUser.name}`;

  // var2: details (message, location, time)
  const var2 = [
    emergency.customMessage ? `Message: ${emergency.customMessage}` : '',
    emergency.location?.locationLink ? `Location: ${emergency.location.locationLink}` : '',
    `Time: ${new Date().toLocaleString()}`
  ].filter(Boolean).join(' | '); // join with safe separator

  console.log('Prepared emergency message:');
  console.log('var1:', var1);
  console.log('var2:', var2);

  // 2️⃣ Send SMS to each family member (skip alert user)
  for (const member of familyMembers) {
    if (member._id.toString() === alertUser._id.toString()) continue;

    if (!member.phoneNumber) {
      console.log(`📵 Member ${member.name} has no phone number`);
      results.failed.push({ member: member._id, reason: 'No phone number' });
      continue;
    }

    try {
      // Ensure proper Indian phone number format
      const phoneNumber = member.phoneNumber.replace(/\D/g, '');
      const mobileNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;

      const payload = { mobiles: mobileNumber, var1, var2 };

      console.log(`📱 Sending to ${member.name} (${mobileNumber})`);
      console.log('Payload:', payload);

      const response = await axios.post(
        'https://www.circuitdigest.cloud/api/v1/send_sms',
        payload,
        {
          params: { ID: '105' }, // your template ID
          headers: {
            'Authorization': process.env.CIRCUIT_DIGEST_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Emergency alert sent to ${member.name}:`, response.data);
      results.successful.push(member._id);

    } catch (error) {
      console.error(`❌ Failed to send alert to ${member.name}:`, error.response?.data || error.message);
      results.failed.push({ member: member._id, error: error.response?.data || error.message });
    }
  }

  return results;
}

module.exports = {
    triggerEmergency,
    getEmergencyHistory,
    resolveEmergency
};