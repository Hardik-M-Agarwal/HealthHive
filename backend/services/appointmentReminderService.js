const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const twilio = require('twilio');

// Initialize Twilio with your credentials
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Your Twilio WhatsApp number and template details
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';
const CONTENT_SID = 'HXb5b62575e6e4ff6129ad7c8efe1f983e'; // Your template SID

// Run every day at 1:15 PM
cron.schedule('50 13 * * *', async () => {
  console.log('🔍 Checking for tomorrow\'s appointments...');
  
  try {
    // Get tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find appointments scheduled for tomorrow that haven't had reminders sent
    const appointments = await Appointment.find({
      dateTime: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      reminderSent: false
    }).populate('userId');
    
    console.log(`📅 Found ${appointments.length} appointments for tomorrow`);
    
    for (const appointment of appointments) {
      await sendAppointmentReminder(appointment);
    }
    
  } catch (error) {
    console.error('Error in appointment reminder cron:', error);
  }
});

async function sendAppointmentReminder(appointment) {
  try {
    const user = appointment.userId;
    
    // Check if user has phone number
    if (!user || !user.phoneNumber) {
      console.log(`📵 User has no phone number, skipping reminder for appointment ${appointment._id}`);
      return;
    }
    
    // Format phone number for WhatsApp (Indian numbers)
    const to = `whatsapp:+91${user.phoneNumber}`;
    
    // Format date and time for template variables
    const appointmentDate = new Date(appointment.dateTime);
    
    // Format date as "MM/DD" (e.g., "12/1")
    const dateStr = `${appointmentDate.getMonth() + 1}/${appointmentDate.getDate()}`;
    
    // Format time as "Xpm" or "Xam" (e.g., "3pm")
    let hours = appointmentDate.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}${ampm}`;
    
    // Prepare content variables for template (only 2 variables)
    const contentVariables = JSON.stringify({
      "1": dateStr,
      "2": timeStr
    });
    
    console.log(`📱 Sending reminder to ${user.name} (${user.phoneNumber})`);
    console.log(`Message: Your appointment is coming up on ${dateStr} at ${timeStr}`);
    
    // Send WhatsApp message using template
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: to,
      contentSid: CONTENT_SID,
      contentVariables: contentVariables
    });
    
    console.log(`✅ Reminder sent successfully to ${user.name}: ${message.sid}`);
    
    // Mark reminder as sent
    appointment.reminderSent = true;
    appointment.reminderSentAt = new Date();
    await appointment.save();
    
  } catch (error) {
    console.error(`❌ Failed to send reminder for appointment ${appointment._id}:`, error);
  }
}

console.log('⏰ Appointment reminder service started (runs daily at 1:15 PM)');