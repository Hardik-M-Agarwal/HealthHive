const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const familyRoutes = require('./routes/familyRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const healthReportRoutes = require('./routes/healthReportRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/health-reports', healthReportRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start reminder service after server is running
  try {
    require('./services/reminderService');
    console.log('✅ Medication reminder service initialized');
  } catch (error) {
    console.error('❌ Failed to start reminder service:', error);
  }

  try {
  require('./services/appointmentReminderService');
  console.log('✅ Appointment reminder service initialized');
} catch (error) {
  console.error('❌ Failed to start appointment reminder service:', error);
}
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});