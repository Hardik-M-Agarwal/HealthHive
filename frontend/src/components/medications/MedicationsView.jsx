import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import medicationService from '../../services/medicationService';
import geminiService from '../../services/geminiService';
import AddMedicationModal from './AddMedicationModal';
import GlobalLogsModal from './GlobalLogsModal';
import toast from 'react-hot-toast';

const MedicationsView = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('all');
  const [members, setMembers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [explainingMedicine, setExplainingMedicine] = useState(null);
  const [medicineExplanation, setMedicineExplanation] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMedications();
    fetchAnalytics();
    fetchFamilyMembers();
  }, [selectedMember]);

  const fetchFamilyMembers = async () => {
    try {
      const response = await medicationService.getFamilyMembers();
      setMembers(response?.family?.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedMember !== 'all') params.member = selectedMember;
      const response = await medicationService.getMedications(params);
      setMedications(response.medications || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedMember !== 'all') params.member = selectedMember;
      const response = await medicationService.getAnalytics(params);
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddMedication = async (medicationData) => {
    try {
      await medicationService.addMedication(medicationData);
      toast.success('Medication added successfully!');
      setShowAddModal(false);
      fetchMedications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    }
  };

  const handleMarkAsTaken = async (medicationId, scheduledTime) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const medication = medications.find(m => m._id === medicationId);
      if (!medication) { toast.error('Medication not found'); return; }
      const todaySchedule = getTodaySchedule(medication);
      if (!todaySchedule.some(s => s.time === scheduledTime)) {
        toast.error('This medication is not scheduled for today');
        return;
      }
      await medicationService.markAsTaken(medicationId, { scheduledTime, scheduledDate: today });
      toast.success('Marked as taken!');
      fetchMedications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error marking as taken:', error);
      toast.error('Failed to mark as taken');
    }
  };

  const handleExplainMedicine = async (medicineName) => {
    try {
      setExplainingMedicine(medicineName);
      setExplanationError('');
      const response = await geminiService.explainMedicine(medicineName);
      setMedicineExplanation(response.explanation);
    } catch (error) {
      console.error('Error explaining medicine:', error);
      setExplanationError(error.response?.data?.message || 'Failed to get explanation');
      setMedicineExplanation('');
    } finally {
      setExplainingMedicine(null);
    }
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-500 bg-red-100';
  };

  const getTodaySchedule = (medication) => {
    if (!medication.schedule) return [];
    const today = new Date().toISOString().split('T')[0];
    return medication.schedule.filter(entry => entry.date === today) || [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDayStatus = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();

    if (todayStr === start.toDateString()) return { text: 'Starting Today', color: 'text-green-600 bg-green-50' };
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (todayStr === end.toDateString()) return { text: 'Ends Today', color: 'text-yellow-600 bg-yellow-50' };
      if (today > end) return { text: 'Completed', color: 'text-slate-500 bg-slate-100' };
    }
    return { text: 'Ongoing', color: 'text-blue-600 bg-blue-50' };
  };

  const getDayNumber = () => new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Today's Date Header */}
      <div className="bg-blue-600 rounded-2xl shadow-sm p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Today's Schedule</h3>
              <p className="text-sm text-blue-100">{getDayNumber()}</p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">Total Active: {medications.length}</span>
          </div>
        </div>
      </div>

      {/* Header with Analytics */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Medication Manager</h2>
            <p className="text-sm text-slate-500 mt-1">Track and manage family medications</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogsModal(true)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Medication Logs</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Medications', value: analytics.summary?.totalMedications || 0 },
              { label: 'Total Doses', value: analytics.summary?.totalDoses || 0 },
              { label: 'Taken Today', value: analytics.summary?.totalTaken || 0 },
              { label: 'Overall Adherence', value: `${Math.round(analytics.summary?.overallAdherence || 0)}%` },
            ].map((card) => (
              <div key={card.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">Filter by:</span>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="all">All Members</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med) => {
          const dayStatus = getDayStatus(med.startDate, med.endDate);
          const todaySchedule = getTodaySchedule(med);

          return (
            <div key={med._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-blue-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{med.medicineName}</h3>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white capitalize">
                    {med.category?.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-1">For: {med.userId?.name}</p>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Duration */}
                <div className="mb-3 p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Duration:</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${dayStatus.color}`}>
                      {dayStatus.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">From:</span>
                    <span className="font-medium text-slate-900">{formatDate(med.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">To:</span>
                    <span className="font-medium text-slate-900">{formatDate(med.endDate)}</span>
                  </div>
                </div>

                {/* Dosage */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-slate-700">Dosage:</span>
                  <span className="text-sm text-slate-600">{med.dosage?.value} {med.dosage?.unit}</span>
                </div>

                {/* Today's Schedule */}
                <div className="mb-3">
                  <span className="text-sm font-medium text-slate-700 block mb-2">Today's Schedule:</span>
                  <div className="space-y-2">
                    {todaySchedule.length > 0 ? (
                      todaySchedule.map((schedule, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-sm text-slate-600">{schedule.time}</span>
                          {schedule.taken ? (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                              ✓ Taken
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkAsTaken(med._id, schedule.time)}
                              className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors font-medium"
                            >
                              Mark as Taken
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No doses scheduled for today</p>
                    )}
                  </div>
                </div>

                {/* Adherence */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Adherence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${med.adherence || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAdherenceColor(med.adherence)}`}>
                        {Math.round(med.adherence || 0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    📝 {med.instructions}
                  </div>
                )}

                {/* Explain Action */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleExplainMedicine(med.medicineName)}
                    disabled={explainingMedicine === med.medicineName}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                  >
                    {explainingMedicine === med.medicineName ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Explaining...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Explain</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {medications.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Medications Added</h3>
          <p className="text-slate-500 text-sm mb-5">Start by adding your first medication</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
          >
            Add Medication
          </button>
        </div>
      )}

      <AddMedicationModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddMedication} />
      <GlobalLogsModal isOpen={showLogsModal} onClose={() => setShowLogsModal(false)} />

      {/* Explanation Modal */}
      {(medicineExplanation || explanationError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-60"
            onClick={() => { setMedicineExplanation(''); setExplanationError(''); }}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {explanationError ? 'Error' : 'Medicine Explanation'}
              </h3>
              <button
                onClick={() => { setMedicineExplanation(''); setExplanationError(''); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {explanationError ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">{explanationError}</div>
            ) : (
              <p className="text-slate-700">{medicineExplanation}</p>
            )}
            <button
              onClick={() => { setMedicineExplanation(''); setExplanationError(''); }}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsView;