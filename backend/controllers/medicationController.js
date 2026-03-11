const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const { validationResult } = require('express-validator');

// @desc    Add new medication
// @route   POST /api/medications
// @access  Private
const addMedication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const familyId = req.user.familyId;

    // Generate schedule based on frequency
    const schedule = generateSchedule(req.body);

    const medication = await Medication.create({
      userId,
      familyId,
      ...req.body,
      schedule
    });

    res.status(201).json({
      success: true,
      medication
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all medications for user/family
// @route   GET /api/medications
// @access  Private
const getMedications = async (req, res) => {
  try {
    const { familyId } = req.user;
    const { status, category, member } = req.query;

    let query = { familyId };
    
    if (status === 'active') {
      query.isActive = true;
      query.endDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (category) {
      query.category = category;
    }

    if (member) {
      query.userId = member;
    }

    const medications = await Medication.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate adherence for each medication
    const medicationsWithAdherence = await Promise.all(
      medications.map(async (med) => {
        const adherence = await calculateAdherence(med._id);
        return {
          ...med.toObject(),
          adherence
        };
      })
    );

    res.json({
      success: true,
      medications: medicationsWithAdherence
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single medication
// @route   GET /api/medications/:id
// @access  Private
const getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id)
      .populate('userId', 'name email');

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check authorization
    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get logs for this medication
    const logs = await MedicationLog.find({ medicationId: medication._id })
      .sort({ scheduledDate: -1 })
      .limit(30);

    const adherence = await calculateAdherence(medication._id);

    res.json({
      success: true,
      medication,
      logs,
      adherence
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = async (req, res) => {
  try {
    let medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check authorization
    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Regenerate schedule if frequency or dates changed
    if (req.body.frequency || req.body.startDate || req.body.endDate) {
      req.body.schedule = generateSchedule({ ...medication.toObject(), ...req.body });
    }

    medication = await Medication.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      medication
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark medication as taken
// @route   POST /api/medications/:id/taken
// @access  Private
const markAsTaken = async (req, res) => {
  try {
    const { scheduledTime, scheduledDate } = req.body;
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check if user has familyId
    if (!req.user.familyId) {
      return res.status(403).json({ message: 'User does not belong to any family' });
    }

    // Check authorization - compare as strings
    if (medication.familyId.toString() !== req.user.familyId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this medication' });
    }

    // Find the schedule entry
    const scheduleEntry = medication.schedule.find(
      s => s.time === scheduledTime
    );

    if (!scheduleEntry) {
      return res.status(400).json({ message: 'Invalid schedule time' });
    }

    // Create log entry
    const log = await MedicationLog.create({
      medicationId: medication._id,
      userId: medication.userId,
      familyId: medication.familyId,
      medicineName: medication.medicineName,
      scheduledTime,
      scheduledDate: new Date(scheduledDate),
      dosage: scheduleEntry.dosage || medication.dosage,
      status: 'taken',
      takenBy: req.user.id
    });

    // Update schedule entry
    scheduleEntry.taken = true;
    scheduleEntry.takenAt = new Date();
    
    await medication.save();

    // Calculate updated adherence
    const adherence = await calculateAdherence(medication._id);

    res.json({
      success: true,
      log,
      adherence
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get medication analytics
// @route   GET /api/medications/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { familyId } = req.user;
    const { startDate, endDate, member } = req.query;

    let query = { familyId };
    if (member) {
      query.userId = member;
    }

    const medications = await Medication.find(query);

    let dateRange = {};
    if (startDate && endDate) {
      dateRange = {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const analytics = await Promise.all(
      medications.map(async (med) => {
        const logs = await MedicationLog.find({
          medicationId: med._id,
          ...dateRange
        });

        const taken = logs.filter(l => l.status === 'taken').length;
        const total = logs.length;

        return {
          medicationId: med._id,
          medicineName: med.medicineName,
          total,
          taken,
          adherence: total > 0 ? (taken / total) * 100 : 0
        };
      })
    );

    // Family-wide stats
    const totalDoses = analytics.reduce((acc, curr) => acc + curr.total, 0);
    const totalTaken = analytics.reduce((acc, curr) => acc + curr.taken, 0);
    const overallAdherence = totalDoses > 0 ? (totalTaken / totalDoses) * 100 : 0;

    res.json({
      success: true,
      analytics,
      summary: {
        totalMedications: medications.length,
        totalDoses,
        totalTaken,
        overallAdherence,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    // Check authorization
    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete - just mark as inactive
    medication.isActive = false;
    await medication.save();

    res.json({
      success: true,
      message: 'Medication deactivated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper Functions

const generateSchedule = (data) => {
  const schedule = [];
  const { frequency, startDate, endDate, dosage, timeOfDay } = data; // Fixed: added timeOfDay
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(start);
  end.setMonth(end.getMonth() + 3); // Default to 3 months if no end date

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Generate daily schedule
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    // Generate times based on frequency
    const times = generateTimes(frequency, timeOfDay);
    
    times.forEach(time => {
      schedule.push({
        time,
        dosage,
        taken: false
      });
    });
  }

  return schedule;
};

const generateTimes = (frequency, timeOfDay) => {
  const times = [];
  
  if (frequency.type === 'daily') {
    const timesPerDay = frequency.timesPerDay || 1;
    
    // If timeOfDay is selected, use those specific times
    if (timeOfDay && timeOfDay.length > 0) {
      // Map timeOfDay to actual times
      const timeMap = {
        'morning': '10:00',
        'afternoon': '14:00',
        'evening': '18:00',
        'night': '22:00'
      };
      
      timeOfDay.forEach(t => {
        if (timeMap[t]) {
          times.push(timeMap[t]);
        }
      });
    } else {
      // Fallback to interval-based times
      const interval = 24 / timesPerDay;
      for (let i = 0; i < timesPerDay; i++) {
        const hour = Math.floor(i * interval);
        times.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
  } else if (frequency.type === 'custom' && frequency.interval) {
    let hour = 0;
    while (hour < 24) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      hour += frequency.interval;
    }
  }

  return times;
};

const calculateAdherence = async (medicationId) => {
  try {
    const medication = await Medication.findById(medicationId);
    if (!medication) return 0;

    const startDate = medication.startDate;
    const endDate = medication.endDate || new Date();
    
    const logs = await MedicationLog.find({
      medicationId,
      scheduledDate: { $gte: startDate, $lte: endDate }
    });

    const totalScheduled = medication.schedule.length;
    const taken = logs.filter(l => l.status === 'taken').length;

    return totalScheduled > 0 ? (taken / totalScheduled) * 100 : 0;
  } catch (error) {
    console.error('Error calculating adherence:', error);
    return 0;
  }
};

module.exports = {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  markAsTaken,
  getAnalytics,
  deleteMedication
};