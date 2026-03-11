import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import medicationService from '../../services/medicationService';
import geminiService from '../../services/geminiService';
import AddMedicationModal from './AddMedicationModal';
import toast from 'react-hot-toast';

const MedicationsView = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
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
      if (selectedMember !== 'all') {
        params.member = selectedMember;
      }
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
      if (selectedMember !== 'all') {
        params.member = selectedMember;
      }
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
      await medicationService.markAsTaken(medicationId, {
        scheduledTime,
        scheduledDate: today
      });
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
    return 'text-red-600 bg-red-100';
  };

  const getTodaySchedule = (medication) => {
    // For now, return all schedule items since we're not storing dates per schedule
    return medication.schedule?.slice(0, medication.frequency?.timesPerDay || 1) || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Medication Manager</h2>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage family medications
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Medication</span>
          </button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary?.totalMedications || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Doses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary?.totalDoses || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Taken Today</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary?.totalTaken || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Overall Adherence</p>
              <p className={`text-2xl font-bold ${getAdherenceColor(analytics.summary?.overallAdherence || 0)} px-2 py-1 rounded-lg inline-block`}>
                {Math.round(analytics.summary?.overallAdherence || 0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        {medications.map((med) => (
          <div key={med._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{med.medicineName}</h3>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs text-white capitalize">
                  {med.category?.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">For: {med.userId?.name}</p>
            </div>

            {/* Body */}
            <div className="p-4">
              {/* Dosage */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Dosage:</span>
                <span className="text-sm text-gray-600">
                  {med.dosage?.value} {med.dosage?.unit}
                </span>
              </div>

              {/* Schedule */}
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 block mb-2">Today's Schedule:</span>
                <div className="space-y-2">
                  {getTodaySchedule(med).map((schedule, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <span className="text-sm text-gray-600">{schedule.time}</span>
                      {schedule.taken ? (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          ✓ Taken
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkAsTaken(med._id, schedule.time)}
                          className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          Mark as Taken
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adherence */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Adherence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${med.adherence || 0}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getAdherenceColor(med.adherence)}`}>
                      {Math.round(med.adherence || 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions if any */}
              {med.instructions && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  📝 {med.instructions}
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => handleExplainMedicine(med.medicineName)}
                  disabled={explainingMedicine === med.medicineName}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 disabled:opacity-50"
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
        ))}
      </div>

      {/* Empty State */}
      {medications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Medications Added</h3>
          <p className="text-gray-500 mb-4">Start by adding your first medication</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Add Medication
          </button>
        </div>
      )}

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMedication}
      />

      {/* Explanation Modal */}
      {(medicineExplanation || explanationError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => {
              setMedicineExplanation('');
              setExplanationError('');
            }}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {explanationError ? 'Error' : 'Medicine Explanation'}
              </h3>
              <button 
                onClick={() => {
                  setMedicineExplanation('');
                  setExplanationError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {explanationError ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {explanationError}
              </div>
            ) : (
              <p className="text-gray-700">{medicineExplanation}</p>
            )}
            
            <button
              onClick={() => {
                setMedicineExplanation('');
                setExplanationError('');
              }}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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