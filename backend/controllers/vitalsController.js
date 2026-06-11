const Vitals = require('../models/Vitals');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const { validationResult } = require('express-validator');

// Helper function to detect abnormal values
const detectAbnormal = (vitalsType, value) => {
  switch(vitalsType) {
    case 'bp':
      if (value.systolic > 140 || value.diastolic > 90) return true;
      break;
    case 'sugar':
      if (value > 200) return true;
      break;
    case 'weight':
      return false;
    case 'pulse':
      if (value < 60 || value > 100) return true;
      break;
    case 'temperature':
      if (value < 97 || value > 99.5) return true;
      break;
    default:
      return false;
  }
  return false;
};

// @desc    Add new vitals reading
// @route   POST /api/vitals
// @access  Private
const addVitals = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vitalsType, value, unit, notes, timestamp } = req.body;
    const userId = req.user.id;
    const familyId = req.user.familyId;

    const abnormalFlag = detectAbnormal(vitalsType, value);

    const vitals = await Vitals.create({
      userId,
      familyId,
      vitalsType,
      value,
      unit,
      abnormalFlag,
      notes,
      timestamp: timestamp || Date.now()
    });

    res.status(201).json({ success: true, vitals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's vitals
// @route   GET /api/vitals/my-vitals
// @access  Private
const getMyVitals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, days } = req.query;

    let query = { userId };
    if (type) query.vitalsType = type;

    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.timestamp = { $gte: date };
    }

    const vitals = await Vitals.find(query).sort({ timestamp: -1 });

    res.json({ success: true, vitals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chart data for current user
// @route   GET /api/vitals/my-chart
// @access  Private
const getMyChartData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, days = 30 } = req.query;

    if (!type) {
      return res.status(400).json({ message: 'Vitals type is required' });
    }

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    const vitals = await Vitals.find({
      userId,
      vitalsType: type,
      timestamp: { $gte: date }
    }).sort({ timestamp: 1 });

    const chartData = vitals.map(v => ({
      date: v.timestamp.toISOString().split('T')[0],
      value: v.value,
      unit: v.unit,
      abnormal: v.abnormalFlag,
      notes: v.notes
    }));

    res.json({
      success: true,
      type,
      days: parseInt(days),
      data: chartData,
      totalReadings: chartData.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get latest vitals for all family members
// @route   GET /api/vitals/family
// @access  Private
const getFamilyVitals = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const { type } = req.query;

    const matchQuery = { familyId };
    if (type) matchQuery.vitalsType = type;

    // Get latest reading per user per vital type using aggregation
    const vitals = await Vitals.aggregate([
      { $match: matchQuery },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: { userId: '$userId', vitalsType: '$vitalsType' },
          value: { $first: '$value' },
          unit: { $first: '$unit' },
          abnormalFlag: { $first: '$abnormalFlag' },
          timestamp: { $first: '$timestamp' }
        }
      }
    ]);

    // Populate member names
    const userIds = [...new Set(vitals.map(v => v._id.userId))];
    const users = await User.find({ _id: { $in: userIds } }, 'name');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    const result = vitals.map(v => ({
      memberId: v._id.userId,
      memberName: userMap[v._id.userId.toString()] || 'Unknown',
      type: v._id.vitalsType,
      value: v.value,
      unit: v.unit,
      abnormal: v.abnormalFlag,
      timestamp: v.timestamp
    }));

    res.json({ success: true, vitals: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Analyze current user's vitals trend using Gemini
// @route   POST /api/vitals/analyze-my-trend
// @access  Private
const analyzeMyTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vitalsType, days = 30 } = req.body;

    if (!vitalsType) {
      return res.status(400).json({ success: false, message: 'Vitals type is required' });
    }

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    const vitals = await Vitals.find({
      userId,
      vitalsType,
      timestamp: { $gte: date }
    }).sort({ timestamp: 1 });

    if (vitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found for analysis. Start by adding some vitals readings!'
      });
    }

    const dataPoints = vitals.map(v => {
      const dateStr = v.timestamp.toISOString().split('T')[0];
      if (vitalsType === 'bp') {
        return `${dateStr}: ${v.value.systolic}/${v.value.diastolic} mmHg`;
      }
      return `${dateStr}: ${v.value} ${v.unit}`;
    }).join('\n');

    const result = await geminiService.analyzeVitalsTrend(vitalsType, dataPoints, days);

    const responseData = {
      success: true,
      analysis: result.analysis,
      dataPoints: vitals.length,
      model: result.model || 'gemini',
      readingCount: vitals.length
    };

    if (result.model === 'fallback') {
      responseData.note = 'Using enhanced statistical analysis while AI is unavailable';
    }

    res.json(responseData);
  } catch (error) {
    console.error('Vitals analysis error:', error);

    let readingCount = 0;
    try {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(req.body.days || 30));
      readingCount = await Vitals.countDocuments({
        userId: req.user.id,
        vitalsType: req.body.vitalsType,
        timestamp: { $gte: date }
      });
    } catch (e) {}

    res.status(500).json({
      success: false,
      message: 'Unable to analyze trend at this moment',
      fallback: readingCount > 0
        ? `You have ${readingCount} reading${readingCount !== 1 ? 's' : ''} recorded. Please try again in a few moments.`
        : 'Start by adding some vitals readings to see trends and analysis!',
      readingCount
    });
  }
};

// @desc    Get summary statistics for current user
// @route   GET /api/vitals/summary
// @access  Private
const getVitalsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    const summary = await Vitals.aggregate([
      { $match: { userId, timestamp: { $gte: date } } },
      {
        $group: {
          _id: '$vitalsType',
          count: { $sum: 1 },
          abnormalCount: { $sum: { $cond: ['$abnormalFlag', 1, 0] } }
        }
      }
    ]);

    const formattedSummary = {};
    summary.forEach(item => {
      formattedSummary[item._id] = { total: item.count, abnormal: item.abnormalCount };
    });

    res.json({ success: true, days: parseInt(days), summary: formattedSummary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addVitals,
  getMyVitals,
  getMyChartData,
  getFamilyVitals,
  analyzeMyTrend,
  getVitalsSummary
};