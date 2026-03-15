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
    const { category, member } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Also get tomorrow's date for end date comparison
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = { 
      familyId,
      isActive: true,
      // Include medications that started today or earlier
      // Use $lte with end of day to handle timezone issues
      startDate: { $lte: new Date(today.setHours(23, 59, 59, 999)) },
      $or: [
        { endDate: { $gte: today } },
        { endDate: null }
      ]
    };

    if (category) {
      query.category = category;
    }

    if (member) {
      query.userId = member;
    }

    const medications = await Medication.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });


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

    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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

    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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

    if (!req.user.familyId) {
      return res.status(403).json({ message: 'User does not belong to any family' });
    }

    if (medication.familyId.toString() !== req.user.familyId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this medication' });
    }

    const scheduleEntry = medication.schedule.find(
      s => s.time === scheduledTime && s.date === scheduledDate
    );

    if (!scheduleEntry) {
      return res.status(400).json({ message: 'Invalid schedule time for this date' });
    }

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

    scheduleEntry.taken = true;
    scheduleEntry.takenAt = new Date();
    
    await medication.save();

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
    const { member } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only get active medications (within date range)
    let query = { 
      familyId,
      isActive: true,
      startDate: { $lte: today },
      $or: [
        { endDate: { $gte: today } },
        { endDate: null }
      ]
    };

    if (member) {
      query.userId = member;
    }

    const medications = await Medication.find(query);

    // Get today's date in YYYY-MM-DD format
    const todayStr = today.toISOString().split('T')[0];

    // Calculate analytics for active medications only
    const analytics = await Promise.all(
      medications.map(async (med) => {
        // Get today's schedule for this medication
        const todaySchedule = med.schedule.filter(s => s.date === todayStr);
        
        // Count taken doses for today
        const takenToday = todaySchedule.filter(s => s.taken).length;
        
        // Get all logs for this medication (for overall adherence)
        const logs = await MedicationLog.find({
          medicationId: med._id
        });

        const totalDoses = med.schedule.length;
        const takenDoses = logs.filter(l => l.status === 'taken').length;

        return {
          medicationId: med._id,
          medicineName: med.medicineName,
          totalDoses: todaySchedule.length,
          takenToday,
          adherence: totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0
        };
      })
    );

    // Calculate summary stats for active medications only
    const totalMedications = medications.length;
    const totalDosesToday = analytics.reduce((acc, curr) => acc + curr.totalDoses, 0);
    const totalTakenToday = analytics.reduce((acc, curr) => acc + curr.takenToday, 0);
    
    // Calculate overall adherence (average)
    const avgAdherence = analytics.reduce((acc, curr) => acc + curr.adherence, 0) / (totalMedications || 1);

    res.json({
      success: true,
      analytics,
      summary: {
        totalMedications,
        totalDoses: totalDosesToday,
        totalTaken: totalTakenToday,
        overallAdherence: avgAdherence
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

    if (medication.familyId.toString() !== req.user.familyId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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

// @desc    Get all medication logs for family
// @route   GET /api/medications/logs/all
// @access  Private
const getAllLogs = async (req, res) => {
  try {
    const { familyId } = req.user;
    const { startDate, endDate, member } = req.query;

    let query = { familyId };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by specific member if provided
    if (member && member !== 'all') {
      query.userId = member;
    }

    const logs = await MedicationLog.find(query)
      .populate('userId', 'name email')
      .populate('takenBy', 'name')
      .populate('medicationId', 'medicineName dosage frequency')
      .sort({ scheduledDate: -1, scheduledTime: -1 });

    res.json({
      success: true,
      logs,
      total: logs.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper Functions

const generateSchedule = (data) => {
  const schedule = [];
  const { frequency, startDate, endDate, dosage, timeOfDay } = data;
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = endDate ? new Date(endDate) : new Date(start);
  end.setMonth(end.getMonth() + 3);
  end.setHours(0, 0, 0, 0);

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const times = generateTimes(frequency, timeOfDay);
    
    times.forEach(time => {
      schedule.push({
        date: dateStr,
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
    
    if (timeOfDay && timeOfDay.length > 0) {
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
  deleteMedication,
  getAllLogs
};