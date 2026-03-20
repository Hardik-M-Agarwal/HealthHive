const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Appointment = require('../models/Appointment');
const Vitals = require('../models/Vitals');
const User = require('../models/User');
const Family = require('../models/Family');

// @desc    Get dashboard data for family
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;

    // Get all family members
    const family = await Family.findById(familyId).populate('members', 'name email role');
    const familyMembers = family?.members || [];

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ HERO SECTION - Family members needing attention
    const attentionNeeded = await getAttentionNeeded(familyMembers, today, endOfDay);
    
    // 2️⃣ FAMILY STRIP - Status for each family member
    const familyStrip = await getFamilyStripData(familyMembers, today);
    
    // 3️⃣ TODAY TIMELINE - Events for today
    const timeline = await getTodayTimeline(familyMembers, today, endOfDay);
    
    // 4️⃣ MEDICATION RING - Overall adherence
    const medicationRing = await getMedicationRingData(familyMembers, today, endOfDay);
    
    // 5️⃣ WHAT'S CHANGING - Trends and insights
    const whatsChanging = await getWhatsChanging(familyMembers);
    
    // 6️⃣ UPCOMING - Next events
    const upcoming = await getUpcomingEvents(familyMembers, today);

    res.json({
      success: true,
      dashboard: {
        hero: attentionNeeded,
        familyStrip,
        timeline,
        medicationRing,
        whatsChanging,
        upcoming
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper: Get family members needing attention
async function getAttentionNeeded(members, today, endOfDay) {
  const attentionList = [];
  let totalNeedingAttention = 0;

  for (const member of members) {
    const issues = [];
    
    // Check missed medications today
    const missedMeds = await MedicationLog.find({
      userId: member._id,
      status: 'missed',
      scheduledDate: { $gte: today, $lte: endOfDay }
    });
    
    if (missedMeds.length > 0) {
      issues.push(`${member.name} missed ${missedMeds.length} medication${missedMeds.length > 1 ? 's' : ''}`);
      totalNeedingAttention++;
    }
    
    // Check appointments today
    const appointments = await Appointment.find({
      userId: member._id,
      dateTime: { $gte: today, $lte: endOfDay }
    });
    
    if (appointments.length > 0) {
      issues.push(`${member.name} has appointment${appointments.length > 1 ? 's' : ''} at ${appointments[0].dateTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
      totalNeedingAttention++;
    }
    
    // Check abnormal vitals today
    const abnormalVitals = await Vitals.find({
      userId: member._id,
      timestamp: { $gte: today, $lte: endOfDay },
      abnormalFlag: true
    });
    
    if (abnormalVitals.length > 0) {
      issues.push(`${member.name}'s ${abnormalVitals[0].vitalsType} is abnormal`);
      totalNeedingAttention++;
    }
    
    // Check pending medications
    const pendingMeds = await Medication.find({
      userId: member._id,
      isActive: true,
      'schedule.date': today.toISOString().split('T')[0],
      'schedule.taken': false
    });
    
    if (pendingMeds.length > 0 && missedMeds.length === 0) {
      issues.push(`${member.name} has ${pendingMeds.length} pending medication${pendingMeds.length > 1 ? 's' : ''}`);
      totalNeedingAttention++;
    }
    
    if (issues.length > 0) {
      attentionList.push({
        member: member.name,
        issues: issues.slice(0, 2), // Max 2 issues per member
        urgency: issues.some(i => i.includes('missed') || i.includes('abnormal')) ? 'high' : 'medium'
      });
    }
  }

  return {
    totalNeedingAttention,
    details: attentionList,
    message: totalNeedingAttention === 0 
      ? "All family members are on track today! 🎉" 
      : `${totalNeedingAttention} family member${totalNeedingAttention > 1 ? 's need' : ' needs'} attention today`
  };
}

// Helper: Get status for each family member (horizontal strip)
async function getFamilyStripData(members, today) {
  const todayStr = today.toISOString().split('T')[0];
  const strip = [];

  for (const member of members) {
    // Check status
    let status = 'good';
    let statusText = 'All good';
    let statusIcon = '🟢';
    
    // Check missed medications
    const missedMeds = await MedicationLog.find({
      userId: member._id,
      status: 'missed',
      scheduledDate: { $gte: today }
    });
    
    if (missedMeds.length > 0) {
      status = 'critical';
      statusText = `Missed ${missedMeds.length}`;
      statusIcon = '🔴';
    } else {
      // Check pending medications
      const pendingMeds = await Medication.find({
        userId: member._id,
        isActive: true,
        'schedule.date': todayStr,
        'schedule.taken': false
      });
      
      if (pendingMeds.length > 0) {
        status = 'warning';
        statusText = `${pendingMeds.length} pending`;
        statusIcon = '🟡';
      }
    }
    
    // Get last vitals
    const lastVitals = await Vitals.findOne({ userId: member._id })
      .sort({ timestamp: -1 });
    
    let stat = statusText;
    if (lastVitals && lastVitals.abnormalFlag) {
      stat = `${lastVitals.vitalsType} high`;
    }
    
    strip.push({
      id: member._id,
      name: member.name,
      initial: member.name.charAt(0).toUpperCase(),
      status,
      statusIcon,
      statusText: stat,
      role: member.role
    });
  }

  return strip;
}

// Helper: Get today's timeline events
async function getTodayTimeline(members, today, endOfDay) {
  const timeline = [];
  
  // Get all medication logs for today
  const logs = await MedicationLog.find({
    userId: { $in: members.map(m => m._id) },
    scheduledDate: { $gte: today, $lte: endOfDay }
  }).populate('userId', 'name');
  
  for (const log of logs) {
    const time = new Date(log.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeline.push({
      type: 'medication',
      time,
      member: log.userId.name,
      action: log.status === 'taken' ? 'took' : 'missed',
      medicine: log.medicineName,
      status: log.status,
      dosage: log.dosage
    });
  }
  
  // Get appointments for today
  const appointments = await Appointment.find({
    userId: { $in: members.map(m => m._id) },
    dateTime: { $gte: today, $lte: endOfDay }
  }).populate('userId', 'name');
  
  for (const apt of appointments) {
    const time = new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timeline.push({
      type: 'appointment',
      time,
      member: apt.userId.name,
      action: 'appointment',
      doctor: apt.doctorName,
      clinic: apt.clinic,
      status: 'upcoming'
    });
  }
  
  // Get pending medications for today
  const todayStr = today.toISOString().split('T')[0];
  const pendingMeds = await Medication.find({
    userId: { $in: members.map(m => m._id) },
    isActive: true,
    'schedule.date': todayStr,
    'schedule.taken': false
  }).populate('userId', 'name');
  
  for (const med of pendingMeds) {
    const scheduleEntry = med.schedule.find(s => s.date === todayStr);
    if (scheduleEntry) {
      timeline.push({
        type: 'pending',
        time: scheduleEntry.time,
        member: med.userId.name,
        action: 'pending',
        medicine: med.medicineName,
        status: 'pending',
        dosage: med.dosage
      });
    }
  }
  
  // Sort by time
  timeline.sort((a, b) => a.time.localeCompare(b.time));
  
  return timeline;
}

// Helper: Get medication ring data
async function getMedicationRingData(members, today, endOfDay) {
  let totalScheduled = 0;
  let totalTaken = 0;
  let totalMissed = 0;
  let totalPending = 0;
  
  const todayStr = today.toISOString().split('T')[0];
  
  for (const member of members) {
    // Get today's scheduled medications
    const medications = await Medication.find({
      userId: member._id,
      isActive: true,
      'schedule.date': todayStr
    }).populate('userId', 'name');
    
    for (const med of medications) {
      const todaySchedule = med.schedule.filter(s => s.date === todayStr);
      totalScheduled += todaySchedule.length;
      
      const taken = todaySchedule.filter(s => s.taken).length;
      totalTaken += taken;
      
      const missed = await MedicationLog.countDocuments({
        userId: member._id,
        status: 'missed',
        scheduledDate: { $gte: today, $lte: endOfDay }
      });
      totalMissed += missed;
      
      totalPending = totalScheduled - totalTaken - totalMissed;
    }
  }
  
  const adherence = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;
  
  return {
    adherence,
    taken: totalTaken,
    missed: totalMissed,
    pending: totalPending,
    total: totalScheduled,
    affectedMembers: members.filter(m => {
      // Count members with scheduled medications
      return true; // Simplified for demo
    }).length
  };
}

// Helper: Get what's changing (trends)
async function getWhatsChanging(members) {
  const insights = [];
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  for (const member of members) {
    // Check vitals trends
    const vitals = await Vitals.find({
      userId: member._id,
      timestamp: { $gte: twoWeeksAgo }
    }).sort({ timestamp: 1 });
    
    const lastWeekVitals = vitals.filter(v => v.timestamp >= lastWeek);
    const prevWeekVitals = vitals.filter(v => v.timestamp < lastWeek);
    
    // Blood pressure trend
    const bpReadings = vitals.filter(v => v.vitalsType === 'bp');
    if (bpReadings.length >= 4) {
      const recent = bpReadings.slice(-3);
      const older = bpReadings.slice(0, 3);
      const recentAvg = recent.reduce((sum, r) => sum + r.value.systolic, 0) / recent.length;
      const olderAvg = older.reduce((sum, r) => sum + r.value.systolic, 0) / older.length;
      
      if (recentAvg > olderAvg + 5) {
        insights.push({
          type: 'vitals',
          member: member.name,
          metric: 'BP',
          direction: 'up',
          change: `${Math.round(recentAvg - olderAvg)}`,
          message: `${member.name}'s BP increased this week`,
          details: `Last week: ${Math.round(olderAvg)} → This week: ${Math.round(recentAvg)}`
        });
      } else if (recentAvg < olderAvg - 5) {
        insights.push({
          type: 'vitals',
          member: member.name,
          metric: 'BP',
          direction: 'down',
          change: `${Math.round(olderAvg - recentAvg)}`,
          message: `${member.name}'s BP improved this week`,
          details: `Last week: ${Math.round(olderAvg)} → This week: ${Math.round(recentAvg)}`
        });
      }
    }
    
    // Sugar trend
    const sugarReadings = vitals.filter(v => v.vitalsType === 'sugar');
    if (sugarReadings.length >= 4) {
      const recent = sugarReadings.slice(-3);
      const older = sugarReadings.slice(0, 3);
      const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
      const olderAvg = older.reduce((sum, r) => sum + r.value, 0) / older.length;
      
      if (recentAvg > olderAvg + 10) {
        insights.push({
          type: 'vitals',
          member: member.name,
          metric: 'Sugar',
          direction: 'up',
          change: `${Math.round(recentAvg - olderAvg)}`,
          message: `${member.name}'s sugar levels increased this week`,
          details: `Last week: ${Math.round(olderAvg)} mg/dL → This week: ${Math.round(recentAvg)} mg/dL`
        });
      } else if (recentAvg < olderAvg - 10) {
        insights.push({
          type: 'vitals',
          member: member.name,
          metric: 'Sugar',
          direction: 'down',
          change: `${Math.round(olderAvg - recentAvg)}`,
          message: `${member.name}'s sugar levels improved this week`,
          details: `Last week: ${Math.round(olderAvg)} mg/dL → This week: ${Math.round(recentAvg)} mg/dL`
        });
      }
    }
  }
  
  // Check medication adherence trend
  const todayStr = now.toISOString().split('T')[0];
  const lastWeekStr = lastWeek.toISOString().split('T')[0];
  
  const thisWeekAdherence = await calculateAdherenceForPeriod(members, lastWeekStr, todayStr);
  const lastWeekAdherence = await calculateAdherenceForPeriod(members, twoWeeksAgo.toISOString().split('T')[0], lastWeekStr);
  
  if (thisWeekAdherence < lastWeekAdherence - 10) {
    insights.push({
      type: 'adherence',
      direction: 'down',
      change: `${Math.round(lastWeekAdherence - thisWeekAdherence)}`,
      message: `Medication adherence dropped by ${Math.round(lastWeekAdherence - thisWeekAdherence)}%`,
      details: `Last week: ${Math.round(lastWeekAdherence)}% → This week: ${Math.round(thisWeekAdherence)}%`
    });
  } else if (thisWeekAdherence > lastWeekAdherence + 10) {
    insights.push({
      type: 'adherence',
      direction: 'up',
      change: `${Math.round(thisWeekAdherence - lastWeekAdherence)}`,
      message: `Medication adherence improved by ${Math.round(thisWeekAdherence - lastWeekAdherence)}%`,
      details: `Last week: ${Math.round(lastWeekAdherence)}% → This week: ${Math.round(thisWeekAdherence)}%`
    });
  }
  
  // Limit to 3 insights
  return insights.slice(0, 3);
}

async function calculateAdherenceForPeriod(members, startDate, endDate) {
  let totalScheduled = 0;
  let totalTaken = 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (const member of members) {
    const logs = await MedicationLog.find({
      userId: member._id,
      scheduledDate: { $gte: start, $lte: end }
    });
    
    totalTaken += logs.filter(l => l.status === 'taken').length;
    
    // Approximate scheduled doses (simplified)
    totalScheduled += logs.length;
  }
  
  return totalScheduled > 0 ? (totalTaken / totalScheduled) * 100 : 100;
}

// Helper: Get upcoming events
async function getUpcomingEvents(members, today) {
  const events = [];
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Get upcoming appointments
  const appointments = await Appointment.find({
    userId: { $in: members.map(m => m._id) },
    dateTime: { $gt: today, $lte: nextWeek }
  }).populate('userId', 'name').sort({ dateTime: 1 });
  
  for (const apt of appointments) {
    const daysUntil = Math.ceil((apt.dateTime - today) / (1000 * 60 * 60 * 24));
    events.push({
      type: 'appointment',
      member: apt.userId.name,
      title: `${apt.doctorName} - ${apt.clinic}`,
      time: apt.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      daysUntil,
      date: apt.dateTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  
  // Get upcoming medication refills (if end date approaching)
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 5);
  
  const medications = await Medication.find({
    userId: { $in: members.map(m => m._id) },
    isActive: true,
    endDate: { $gte: today, $lte: soon }
  }).populate('userId', 'name');
  
  for (const med of medications) {
    const daysUntil = Math.ceil((med.endDate - today) / (1000 * 60 * 60 * 24));
    events.push({
      type: 'refill',
      member: med.userId.name,
      title: `Refill ${med.medicineName}`,
      daysUntil,
      date: med.endDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
    });
  }
  
  // Sort by days until
  events.sort((a, b) => a.daysUntil - b.daysUntil);
  
  // Group by days
  const grouped = {
    tomorrow: events.filter(e => e.daysUntil === 1),
    in2Days: events.filter(e => e.daysUntil === 2),
    in3Days: events.filter(e => e.daysUntil === 3),
    in4Days: events.filter(e => e.daysUntil === 4),
    in5Days: events.filter(e => e.daysUntil === 5),
    later: events.filter(e => e.daysUntil > 5)
  };
  
  return {
    events: events.slice(0, 5),
    grouped
  };
}

module.exports = {
  getDashboardData
};