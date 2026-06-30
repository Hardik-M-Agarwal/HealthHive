const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const dns = require('dns')

// Load env vars
dotenv.config();

dns.setServers(['1.1.1.1', '8.8.8.8']);

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
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const internalRoutes = require('./routes/internalRoutes');

const app = express();

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Allow multiple origins (local dev + deployed frontend) without hardcoding.
// Set FRONTEND_URL on Render to your Vercel URL once deployed.
// Comma-separate multiple origins if needed, e.g.
// FRONTEND_URL=https://healthhive.vercel.app,https://www.healthhive.app
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser tools (curl, Postman, n8n) which send no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors(corsOptions));

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
app.use('/api/documents', documentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/internal', internalRoutes);

// Root route — used by Render for health checks
app.get('/', (req, res) => res.send('HealthHive API running 🚀'));

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