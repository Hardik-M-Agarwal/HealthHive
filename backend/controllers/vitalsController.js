const Vitals = require('../models/Vitals');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper function to detect abnormal values
const detectAbnormal = (vitalsType, value) => {
  switch(vitalsType) {
    case 'bp':
      // Expected format: { systolic: number, diastolic: number }
      if (value.systolic > 140 || value.diastolic > 90) {
        return true;
      }
      break;
    case 'sugar':
      // Fasting > 126, random > 200
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

    // Detect if value is abnormal
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

    res.status(201).json({
      success: true,
      vitals
    });
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
    
    if (type) {
      query.vitalsType = type;
    }

    // Filter by last X days
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.timestamp = { $gte: date };
    }

    const vitals = await Vitals.find(query)
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      vitals
    });
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

    // Format data for chart
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
      data: chartData
    });
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
    const { vitalsType, days = 10 } = req.body;

    const date = new Date();
    date.setDate(date.getDate() - parseInt(days));

    const vitals = await Vitals.find({
      userId,
      vitalsType,
      timestamp: { $gte: date }
    }).sort({ timestamp: 1 });

    if (vitals.length === 0) {
      return res.status(404).json({ message: 'No data found for analysis' });
    }

    // Format data for Gemini
    const dataPoints = vitals.map(v => {
      if (vitalsType === 'bp') {
        return `${v.timestamp.toISOString().split('T')[0]}: ${v.value.systolic}/${v.value.diastolic} mmHg`;
      }
      return `${v.timestamp.toISOString().split('T')[0]}: ${v.value} ${v.unit}`;
    }).join('\n');

    const vitalsTypeDisplay = {
      'bp': 'Blood Pressure',
      'sugar': 'Blood Sugar',
      'weight': 'Weight',
      'pulse': 'Pulse Rate',
      'temperature': 'Temperature'
    }[vitalsType];

    const prompt = `Analyze this ${vitalsTypeDisplay} trend from the last ${days} days and explain it in simple, easy-to-understand language for a patient:\n\n${dataPoints}\n\nProvide insights on patterns, abnormalities, and general health implications. Keep it encouraging and actionable.`;

    // Call Gemini API
    const axios = require('axios');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = response.data.candidates[0]?.content?.parts[0]?.text;

    if (!analysis) {
      return res.status(500).json({ message: 'No analysis received from Gemini' });
    }

    res.json({
      success: true,
      analysis,
      dataPoints: vitals.length
    });

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.error?.message || 'Failed to analyze trend'
    });
  }
};

module.exports = {
  addVitals,
  getMyVitals,
  getMyChartData,
  analyzeMyTrend
};