import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import vitalsService from '../../services/vitalsService';
import AddVitalsModal from './AddVitalsModal';
import VitalsChart from './VitalsChart';
import toast from 'react-hot-toast';

const VitalsView = () => {
  const [vitalsData, setVitalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('bp');
  const [days, setDays] = useState(30);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();

  const vitalsTypes = [
    { value: 'bp', label: 'Blood Pressure', icon: '❤️', color: 'from-red-500 to-pink-500' },
    { value: 'sugar', label: 'Blood Sugar', icon: '🩸', color: 'from-purple-500 to-indigo-500' },
    { value: 'weight', label: 'Weight', icon: '⚖️', color: 'from-green-500 to-emerald-500' },
    { value: 'pulse', label: 'Pulse', icon: '💓', color: 'from-orange-500 to-yellow-500' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️', color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    fetchVitals();
    setAnalysis(null);
  }, [selectedType, days]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      setVitalsData([]);

      const response = await vitalsService.getMyChartData({
        type: selectedType,
        days
      });

      setVitalsData(response?.data || []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast.error('Failed to load vitals data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVitals = async (vitalsData) => {
    try {
      await vitalsService.addVitals(vitalsData);
      toast.success('Vitals reading added successfully!');
      setShowAddModal(false);
      fetchVitals();
    } catch (error) {
      console.error('Error adding vitals:', error);
      toast.error('Failed to add vitals reading');
    }
  };

  const handleAnalyzeTrend = async () => {
    try {
      setAnalyzing(true);
      setAnalysis(null);

      const response = await vitalsService.analyzeMyTrend({
        vitalsType: selectedType,
        days
      });

      setAnalysis(response?.analysis || 'No analysis available');
    } catch (error) {
      console.error('Error analyzing trend:', error);
      toast.error('Failed to analyze trend');
    } finally {
      setAnalyzing(false);
    }
  };

  const getLatestReading = () => {
    if (!vitalsData || vitalsData.length === 0) return null;
    return vitalsData[vitalsData.length - 1];
  };

  const getAverageReading = () => {
    if (!vitalsData || vitalsData.length === 0) return null;

    if (selectedType === 'bp') {
      const systolicAvg =
        vitalsData.reduce((sum, item) => sum + (item?.value?.systolic || 0), 0) /
        vitalsData.length;

      const diastolicAvg =
        vitalsData.reduce((sum, item) => sum + (item?.value?.diastolic || 0), 0) /
        vitalsData.length;

      return `${Math.round(systolicAvg)}/${Math.round(diastolicAvg)}`;
    } else {
      const avg =
        vitalsData.reduce((sum, item) => {
          const val = item?.value;
          return sum + (typeof val === 'number' ? val : 0);
        }, 0) / vitalsData.length;

      return Math.round(avg * 10) / 10;
    }
  };

  const getAbnormalCount = () => {
    if (!vitalsData) return 0;
    return vitalsData.filter(item => item?.abnormal).length;
  };

  const latestReading = getLatestReading();

  const renderLatestValue = () => {
    if (!latestReading) return "-";

    if (selectedType === "bp") {
      return `${latestReading?.value?.systolic ?? "-"} / ${latestReading?.value?.diastolic ?? "-"}`;
    }

    if (typeof latestReading?.value === "number") {
      return latestReading.value;
    }

    return "-";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Vitals Tracker</h2>
            <p className="text-sm text-gray-500 mt-1">
              Track and monitor your health vitals
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Reading</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Readings</p>
            <p className="text-2xl font-bold text-gray-900">
              {vitalsData?.length || 0}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Latest</p>
            <p className="text-2xl font-bold text-gray-900">
              {renderLatestValue()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {getAverageReading() || '-'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Abnormal Readings</p>
            <p className="text-2xl font-bold text-yellow-600">
              {getAbnormalCount()}
            </p>
          </div>

        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Vital Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {vitalsTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <VitalsChart
            data={vitalsData}
            type={selectedType}
            onAnalyze={handleAnalyzeTrend}
          />

          {analyzing && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 text-purple-600">
                <span>Analyzing your trends with Gemini...</span>
              </div>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Insight</h3>
              <p className="text-gray-700 whitespace-pre-line">{analysis}</p>
            </div>
          )}
        </>
      )}

      <AddVitalsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddVitals}
      />

    </div>
  );
};

export default VitalsView;