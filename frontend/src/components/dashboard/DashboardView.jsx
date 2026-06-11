import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import medicationService from '../../services/medicationService';
import appointmentService from '../../services/appointmentService';
import vitalsService from '../../services/vitalsService';
import toast from 'react-hot-toast';

// ─── Health quotes (static, no API needed) ───────────────────────────────────
const HEALTH_QUOTES = [
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Health is not valued till sickness comes.", author: "Thomas Fuller" },
  { text: "An apple a day keeps the doctor away.", author: "Proverb" },
  { text: "The greatest wealth is health.", author: "Virgil" },
  { text: "Your body hears everything your mind says.", author: "Naomi Judd" },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich" },
  { text: "Happiness is the highest form of health.", author: "Dalai Lama" },
  { text: "Good health is not something we can buy. However, it can be an extremely valuable savings account.", author: "Anne Wilson Schaef" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getDailyQuote = () => {
  const idx = new Date().getDate() % HEALTH_QUOTES.length;
  return HEALTH_QUOTES[idx];
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getDaysUntil = (dateTime) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateTime); d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
};

const TIME_SLOTS = [
  { key: 'morning',   label: 'Morning',   icon: '🌅', time: '10:00' },
  { key: 'afternoon', label: 'Afternoon', icon: '☀️',  time: '14:00' },
  { key: 'evening',   label: 'Evening',   icon: '🌆', time: '18:00' },
  { key: 'night',     label: 'Night',     icon: '🌙', time: '22:00' },
];

const VITAL_CONFIG = {
  bp:          { label: 'Blood Pressure', unit: 'mmHg', icon: '❤️',  normalRange: 'Sys < 140' },
  sugar:       { label: 'Blood Sugar',    unit: 'mg/dL', icon: '🩸', normalRange: '< 200' },
  weight:      { label: 'Weight',         unit: 'kg',   icon: '⚖️',  normalRange: '—' },
  pulse:       { label: 'Pulse',          unit: 'bpm',  icon: '💓',  normalRange: '60–100' },
  temperature: { label: 'Temperature',   unit: '°F',   icon: '🌡️', normalRange: '97–99.5' },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
const DashboardView = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [familyVitals, setFamilyVitals] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingTaken, setMarkingTaken] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const quote = getDailyQuote();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [medsRes, apptRes, membersRes] = await Promise.allSettled([
        medicationService.getMedications(),
        appointmentService.getMyAppointments(),
        medicationService.getFamilyMembers(),
      ]);

      const meds = medsRes.status === 'fulfilled' ? medsRes.value.medications || [] : [];
      const apts = apptRes.status === 'fulfilled' ? apptRes.value.appointments || [] : [];
      const members = membersRes.status === 'fulfilled'
        ? (membersRes.value?.family?.members || [])
        : [];

      setMedications(meds);
      setAppointments(apts);
      setFamilyMembers(members);

      // Fetch family vitals using new /vitals/family endpoint
      try {
        const vitalsRes = await vitalsService.getFamilyVitals();
        setFamilyVitals(vitalsRes.vitals || []);
      } catch (_) {
        setFamilyVitals([]);
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (medId, scheduledTime) => {
    try {
      setMarkingTaken(`${medId}-${scheduledTime}`);
      const today = new Date().toISOString().split('T')[0];
      await medicationService.markAsTaken(medId, { scheduledTime, scheduledDate: today });
      toast.success('Marked as taken!');
      fetchAll();
    } catch {
      toast.error('Failed to mark as taken');
    } finally {
      setMarkingTaken(null);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  const todayMeds = medications.filter(med => {
    if (!med.schedule) return false;
    return med.schedule.some(s => s.date === today);
  });

  const totalDosesToday = todayMeds.reduce((acc, med) => {
    return acc + med.schedule.filter(s => s.date === today).length;
  }, 0);

  const takenToday = todayMeds.reduce((acc, med) => {
    return acc + med.schedule.filter(s => s.date === today && s.taken).length;
  }, 0);

  const upcomingApts = appointments
    .filter(a => getDaysUntil(a.dateTime) >= 0)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const nextApt = upcomingApts[0];

  const abnormalVitalsCount = familyVitals.filter(v => v.abnormal).length;

  // Meds grouped by time slot — match each schedule entry time to slot time exactly
  const medsBySlot = TIME_SLOTS.map(slot => {
    const slotMeds = [];
    todayMeds.forEach(med => {
      const todaySchedules = med.schedule.filter(s => s.date === today && s.time === slot.time);
      todaySchedules.forEach(s => {
        slotMeds.push({ med, schedule: s });
      });
    });
    return { ...slot, meds: slotMeds };
  });

  // Latest vital per type across family (most recent reading)
  const latestPerType = {};
  Object.keys(VITAL_CONFIG).forEach(type => {
    const readings = familyVitals
      .filter(v => v.type === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    // Group by member, take latest per member
    const byMember = {};
    readings.forEach(r => {
      if (!byMember[r.memberId]) byMember[r.memberId] = r;
    });
    latestPerType[type] = Object.values(byMember);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Section 1: Welcome Banner ───────────────────────────────────── */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">{formatDate()}</p>
            <h2 className="text-2xl font-bold mt-1">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-blue-100 text-sm mt-3 italic max-w-md">
              "{quote.text}" <span className="not-italic font-medium">— {quote.author}</span>
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{medications.length}</p>
              <p className="text-xs text-blue-100">Active Meds</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{upcomingApts.length}</p>
              <p className="text-xs text-blue-100">Upcoming Apts</p>
            </div>
            <div className={`rounded-xl px-4 py-2 text-center ${abnormalVitalsCount > 0 ? 'bg-red-400/40' : 'bg-white/20'}`}>
              <p className="text-xl font-bold">{abnormalVitalsCount}</p>
              <p className="text-xs text-blue-100">Abnormal Vitals</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Quick Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Meds Today"
          value={`${takenToday}/${totalDosesToday}`}
          sub={totalDosesToday === 0 ? 'No doses today' : takenToday === totalDosesToday ? '✓ All taken' : `${totalDosesToday - takenToday} remaining`}
          color="bg-blue-50"
        />
        <StatCard
          icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          label="Next Appointment"
          value={nextApt ? `${getDaysUntil(nextApt.dateTime) === 0 ? 'Today' : getDaysUntil(nextApt.dateTime) === 1 ? 'Tomorrow' : `In ${getDaysUntil(nextApt.dateTime)} days`}` : '—'}
          sub={nextApt ? `Dr. ${nextApt.doctorName}` : 'No upcoming appointments'}
          color="bg-green-50"
        />
        <StatCard
          icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
          label="Abnormal Vitals"
          value={abnormalVitalsCount}
          sub={abnormalVitalsCount === 0 ? 'All readings normal' : 'Needs attention'}
          color="bg-red-50"
        />
        <StatCard
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Family Members"
          value={familyMembers.length}
          sub="In your family group"
          color="bg-purple-50"
        />
      </div>

      {/* ── Section 3: Today's Medication Schedule ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Today's Medication Schedule</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-slate-500">{takenToday} of {totalDosesToday} taken</span>
          </div>
        </div>

        {totalDosesToday === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-400 text-sm">No medications scheduled for today</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {medsBySlot.map(slot => slot.meds.length > 0 && (
              <div key={slot.key} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{slot.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{slot.label}</span>
                  <span className="text-xs text-slate-400">{slot.time}</span>
                </div>
                <div className="space-y-2 pl-7">
                  {slot.meds.map(({ med, schedule }, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${schedule.taken ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${schedule.taken ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{med.medicineName}</p>
                          <p className="text-xs text-slate-400">
                            {med.dosage?.value} {med.dosage?.unit}
                            {med.userId?.name ? ` • ${med.userId.name}` : ''}
                          </p>
                        </div>
                      </div>
                      {schedule.taken ? (
                        <span className="text-xs text-green-600 bg-green-100 px-2.5 py-1 rounded-full font-medium">✓ Taken</span>
                      ) : (
                        <button
                          onClick={() => handleMarkTaken(med._id, schedule.time)}
                          disabled={markingTaken === `${med._id}-${schedule.time}`}
                          className="text-xs text-blue-600 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50"
                        >
                          {markingTaken === `${med._id}-${schedule.time}` ? '...' : 'Mark Taken'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 4: Upcoming Appointments ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">Upcoming Appointments</h3>
        </div>

        {upcomingApts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-400 text-sm">No upcoming appointments</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {upcomingApts.slice(0, 5).map((apt, i) => {
              const days = getDaysUntil(apt.dateTime);
              const badgeText = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
              const badgeColor = days === 0 ? 'bg-blue-600 text-white' : days === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600';
              return (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">Dr. {apt.doctorName}</p>
                      <p className="text-xs text-slate-400 truncate">{apt.clinic}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>{badgeText}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(apt.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 5: Family Vitals Overview ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">Family Vitals Overview</h3>
          <span className="text-xs text-slate-400 ml-auto">Latest readings per member</span>
        </div>

        {familyVitals.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-slate-400 text-sm">No vitals recorded yet</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(VITAL_CONFIG).map(([type, config]) => {
              const readings = latestPerType[type] || [];
              if (readings.length === 0) return null;
              return (
                <div key={type} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">{config.label}</span>
                    <span className="text-xs text-slate-400 ml-auto">Normal: {config.normalRange}</span>
                  </div>
                  <div className="space-y-2">
                    {readings.map((r, i) => {
                      const displayVal = type === 'bp'
                        ? `${r.value?.systolic ?? '—'}/${r.value?.diastolic ?? '—'}`
                        : r.value ?? '—';
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {r.memberName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-700">{r.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {displayVal} <span className="text-xs font-normal text-slate-400">{config.unit}</span>
                            </span>
                            <span className={`w-2 h-2 rounded-full ${r.abnormal ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 6: Emergency Panel ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900">Emergency</h3>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
          {/* Emergency button */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="w-24 h-24 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full flex flex-col items-center justify-center gap-1 shadow-lg transition-all duration-200 font-bold text-sm"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              SOS
            </button>
            <p className="text-xs text-slate-400 text-center">Tap to alert family</p>
          </div>

          {/* Emergency contacts */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 mb-3">Emergency Contacts</p>
            {familyMembers.length === 0 ? (
              <p className="text-sm text-slate-400">No emergency contacts found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {familyMembers.slice(0, 4).map((member, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900 bg-opacity-60" onClick={() => setShowEmergencyModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Send Emergency Alert?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This will notify all family members with your location. Use the full Emergency feature for more options.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowEmergencyModal(false); toast.error('Use the Emergency button in the main menu for full SOS functionality.'); }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
              >
                Confirm SOS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;