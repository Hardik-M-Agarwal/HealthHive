const cron = require('node-cron');
const Medication = require('../models/Medication');
const User = require('../models/User');
const axios = require('axios');

// Fixed medication times (based on your timeOfDay mappings)
const MEDICATION_TIMES = {
  morning: '10:00',
  afternoon: '14:00',
  evening: '18:00',
  night: '22:00'
};

// Calculate reminder times (30 minutes before each medication time)
const REMINDER_TIMES = {
  morning: '09:30',
  afternoon: '13:30',
  evening: '17:30',
  night: '21:30'
};

// Schedule cron jobs for each reminder time
Object.entries(REMINDER_TIMES).forEach(([timeOfDay, reminderTime]) => {
  const [hour, minute] = reminderTime.split(':');
  
  // Schedule cron job to run every day at this specific time
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    console.log(`⏰ Running ${timeOfDay} reminder check at ${reminderTime}`);
    
    try {
      const medicationTime = MEDICATION_TIMES[timeOfDay];
      await checkAndSendReminders(medicationTime, timeOfDay);
    } catch (error) {
      console.error(`Error in ${timeOfDay} reminder cron:`, error);
    }
  });
  
  console.log(`✅ Scheduled ${timeOfDay} reminder for ${reminderTime}`);
});

// Function to check for medications and send reminders
async function checkAndSendReminders(medicationTime, timeOfDay) {
  try {
    const now = new Date();
    
    console.log(`🔍 Checking for medications scheduled at ${medicationTime} (${timeOfDay})`);

    // Find all medications scheduled at this time
    const medications = await Medication.find({
      'schedule.time': medicationTime,
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    }).populate('userId', 'name phoneNumber');

    console.log(`📊 Found ${medications.length} medications scheduled at ${medicationTime}`);

    // Group medications by user to send one SMS per user with all medications
    const userMedications = {};

    medications.forEach(med => {
      const userId = med.userId._id.toString();
      if (!userMedications[userId]) {
        userMedications[userId] = {
          user: med.userId,
          medications: []
        };
      }
      userMedications[userId].medications.push(med);
    });

    // Send reminders for each user
    for (const [userId, data] of Object.entries(userMedications)) {
      await sendUserReminder(data.user, data.medications, medicationTime, timeOfDay);
    }

  } catch (error) {
    console.error('Error checking medications:', error);
  }
}

// Function to send SMS reminder to a specific user
async function sendUserReminder(user, medications, medicationTime, timeOfDay) {
  try {
    if (!user.phoneNumber) {
      console.log(`📵 User ${user.name} has no phone number, skipping reminder`);
      return;
    }

    // Format phone number with country code (India: 91)
    const mobileNumber = `91${user.phoneNumber}`;

    // Prepare medication list
    const medicationList = medications.map(med => 
      `${med.medicineName} (${med.dosage.value} ${med.dosage.unit})`
    ).join(', ');

    // Create message based on number of medications
    let message;
    if (medications.length === 1) {
      message = `Reminder: Take ${medications[0].medicineName} (${medications[0].dosage.value} ${medications[0].dosage.unit}) at ${medicationTime} (${timeOfDay}).`;
    } else {
      message = `Reminder: Take your medications at ${medicationTime} (${timeOfDay}): ${medicationList}`;
    }

    console.log(`📱 Sending reminder to ${user.name} (${user.phoneNumber}): ${message}`);

    // CORRECTED: Circuit Digest API call with proper format
    const response = await axios.post(
      'https://www.circuitdigest.cloud/api/v1/send_sms',
      {
        mobiles: mobileNumber,
        var1: message,
        var2: timeOfDay // Using timeOfDay as the second variable
      },
      {
        params: {
          ID: '105' // Uppercase ID as required
        },
        headers: {
          'Authorization': process.env.CIRCUIT_DIGEST_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Reminder sent successfully to ${user.name}:`, response.data);

    // Optional: Log the reminder
    await logReminder(user._id, medications, medicationTime, 'sent', response.data);

  } catch (error) {
    console.error(`❌ Failed to send reminder to ${user.name}:`, error.response?.data || error.message);
    
    // Optional: Log the failure
    await logReminder(user._id, medications, medicationTime, 'failed', error.message);
  }
}

// Optional: Log reminders to database
async function logReminder(userId, medications, scheduledTime, status, details) {
  try {
    const ReminderLog = require('../models/ReminderLog');
    
    await ReminderLog.create({
      userId,
      medicationIds: medications.map(m => m._id),
      scheduledTime,
      status,
      details,
      sentAt: new Date()
    });
  } catch (error) {
    console.error('Error logging reminder:', error);
  }
}

console.log('🚀 Medication reminder service started');