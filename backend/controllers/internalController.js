const Family        = require('../models/Family');
const User          = require('../models/User');
const Vitals        = require('../models/Vitals');
const MedicationLog = require('../models/MedicationLog');
const HealthProfile = require('../models/HealthProfile');
const geminiService = require('../services/geminiService');
const mongoose      = require('mongoose');

// ─── Get all families with members ───────────────────────────────────────────
const getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find({}).lean();

    const result = await Promise.all(families.map(async (family) => {
      const members = await User.find(
        { familyId: family._id },
        'name email role _id'
      ).lean();
      return { ...family, members };
    }));

    res.json({ success: true, families: result });
  } catch (error) {
    console.error('Internal getAllFamilies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get weekly vitals summary for a member ───────────────────────────────────
const getMemberVitals = async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const vitals = await Vitals.find({
      userId: new mongoose.Types.ObjectId(userId),
      timestamp: { $gte: since }
    }).lean();

    const grouped = {};
    vitals.forEach(v => {
      if (!grouped[v.vitalsType]) grouped[v.vitalsType] = [];
      grouped[v.vitalsType].push(v);
    });

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const stdDev = (arr) => {
      if (!arr.length) return 0;
      const mean = avg(arr);
      return Math.sqrt(avg(arr.map(x => Math.pow(x - mean, 2))));
    };

    const bpReadings     = (grouped['bp']     || []).map(v => v.value);
    const sugarReadings  = (grouped['sugar']  || []).map(v => v.value);
    const pulseReadings  = (grouped['pulse']  || []).map(v => v.value);
    const weightReadings = (grouped['weight'] || []).map(v => v.value);

    const systolicArr  = bpReadings.map(v => v.systolic).filter(Boolean);
    const diastolicArr = bpReadings.map(v => v.diastolic).filter(Boolean);

    res.json({
      success: true,
      userId,
      period_days: days,
      summary: {
        avg_systolic:      systolicArr.length   ? parseFloat(avg(systolicArr).toFixed(1))    : null,
        avg_diastolic:     diastolicArr.length  ? parseFloat(avg(diastolicArr).toFixed(1))   : null,
        bp_variability:    systolicArr.length   ? parseFloat(stdDev(systolicArr).toFixed(1)) : 0,
        avg_glucose:       sugarReadings.length ? parseFloat(avg(sugarReadings).toFixed(1))  : null,
        sugar_variability: sugarReadings.length ? parseFloat(stdDev(sugarReadings).toFixed(1)): 0,
        avg_pulse:         pulseReadings.length ? parseFloat(avg(pulseReadings).toFixed(1))  : null,
        avg_weight:        weightReadings.length? parseFloat(avg(weightReadings).toFixed(1)) : null,
      },
      readings_count: vitals.length
    });
  } catch (error) {
    console.error('Internal getMemberVitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get weekly medication summary for a member ───────────────────────────────
const getMemberMedications = async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await MedicationLog.find({
      userId: new mongoose.Types.ObjectId(userId),
      scheduledDate: { $gte: since }
    }).lean();

    const totalDoses    = logs.length;
    const takenDoses    = logs.filter(l => l.status === 'taken').length;
    const missedDoses   = logs.filter(l => l.status === 'missed').length;
    const adherenceRate = totalDoses > 0
      ? parseFloat((takenDoses / totalDoses).toFixed(2))
      : 1.0;

    res.json({
      success: true,
      userId,
      period_days: days,
      summary: {
        total_doses:    totalDoses,
        taken_doses:    takenDoses,
        missed_doses:   missedDoses,
        adherence_rate: adherenceRate,
      }
    });
  } catch (error) {
    console.error('Internal getMemberMedications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Get health profile for a member ─────────────────────────────────────────
const getMemberProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await HealthProfile.findOne({
      userId: new mongoose.Types.ObjectId(userId)
    }).lean();

    if (!profile) {
      return res.json({
        success: true,
        profile: {
          age: 30, bmi: 25.0,
          height: 170, weight: 70,
          bloodGroup: 'Unknown',
          allergies: [], allergies_count: 0,
          chronicConditions: [], has_chronic_condition: 0,
          pastDiseases: [], emergencyContacts: []
        }
      });
    }

    let age = 30;
    if (profile.dateOfBirth) {
      age = Math.floor(
        (Date.now() - new Date(profile.dateOfBirth)) /
        (1000 * 60 * 60 * 24 * 365.25)
      );
    }

    const height = profile.height || 170;
    const weight = profile.weight || 70;
    const bmi    = parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));

    res.json({
      success: true,
      profile: {
        ...profile,
        age,
        bmi,
        has_chronic_condition: (profile.chronicConditions || []).length > 0 ? 1 : 0,
        allergies_count:       (profile.allergies || []).length,
      }
    });
  } catch (error) {
    console.error('Internal getMemberProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Generate health summary using Gemini ─────────────────────────────────────
const generateHealthSummary = async (req, res) => {
  try {
    const {
      member_name,
      age,
      health_score,
      health_grade,
      weekly_stats,
      risk_assessment,
      contributing_factors,
      positive_factors
    } = req.body;

    const prompt = `You are a friendly family health advisor writing a weekly health summary for a family health portal. Be warm, supportive, and non-scary. Explain findings in simple everyday language. Acknowledge positives before concerns. Never use alarming medical jargon.

MEMBER: ${member_name}, Age ${age}
HEALTH SCORE: ${health_score}/100 (Grade ${health_grade})

VITALS THIS WEEK:
- Blood Pressure: ${weekly_stats.avg_systolic}/${weekly_stats.avg_diastolic} mmHg
- Blood Sugar: ${weekly_stats.avg_glucose} mg/dL
- Pulse: ${weekly_stats.avg_pulse} bpm
- Medication Adherence: ${(weekly_stats.adherence_rate * 100).toFixed(0)}%
- Doses Missed: ${weekly_stats.doses_missed}

RISK LEVELS (from ML model):
- Diabetes: ${risk_assessment.diabetes.risk_level}
- Hypertension: ${risk_assessment.hypertension.risk_level}
- Cardiovascular: ${risk_assessment.cardiovascular.risk_level}

WHAT NEEDS ATTENTION: ${contributing_factors.length ? contributing_factors.join(', ') : 'Nothing major'}
WHAT IS GOING WELL: ${positive_factors.join(', ')}

Respond ONLY with valid JSON — no markdown, no backticks, no extra text:
{"weekly_summary": "3-4 warm sentences about their week", "actionable_tip": "one specific actionable tip for this week", "closing_motivation": "one short encouraging sentence"}`;

    const result = await geminiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024
    });

    // Fallback if Gemini fails
    if (!result.success || !result.text) {
      return res.json({
        success: true,
        weekly_summary: `${member_name}, you had a solid week overall! Your health indicators are being tracked and everything looks stable. Keep maintaining your current routine and stay consistent with your medications.`,
        actionable_tip: 'Try to log your vitals at least twice this week to build a better health picture.',
        closing_motivation: 'Every healthy choice you make today is an investment in your future!'
      });
    }

    // Extract JSON from response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini response as JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      weekly_summary:    parsed.weekly_summary    || '',
      actionable_tip:    parsed.actionable_tip    || '',
      closing_motivation: parsed.closing_motivation || '',
      model_used: result.model
    });

  } catch (error) {
    console.error('Internal generateHealthSummary error:', error);
    res.json({
      success: true,
      weekly_summary: `Great effort this week! Keep tracking your health and staying consistent.`,
      actionable_tip: 'Stay consistent with your medications and drink plenty of water.',
      closing_motivation: 'Small consistent steps lead to big health improvements!'
    });
  }
};

module.exports = {
  getAllFamilies,
  getMemberVitals,
  getMemberMedications,
  getMemberProfile,
  generateHealthSummary
};