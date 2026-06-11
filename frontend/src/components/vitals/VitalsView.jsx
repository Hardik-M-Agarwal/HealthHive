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
    { value: 'bp', label: 'Blood Pressure', icon: '❤️' },
    { value: 'sugar', label: 'Blood Sugar', icon: '🩸' },
    { value: 'weight', label: 'Weight', icon: '⚖️' },
    { value: 'pulse', label: 'Pulse', icon: '💓' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️' }
  ];

  useEffect(() => {
    fetchVitals();
    setAnalysis(null);
  }, [selectedType, days]);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      setVitalsData([]);
      const response = await vitalsService.getMyChartData({ type: selectedType, days });
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
      const response = await vitalsService.analyzeMyTrend({ vitalsType: selectedType, days });
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
      const systolicAvg = vitalsData.reduce((sum, item) => sum + (item?.value?.systolic || 0), 0) / vitalsData.length;
      const diastolicAvg = vitalsData.reduce((sum, item) => sum + (item?.value?.diastolic || 0), 0) / vitalsData.length;
      return `${Math.round(systolicAvg)}/${Math.round(diastolicAvg)}`;
    } else {
      const avg = vitalsData.reduce((sum, item) => {
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
    if (!latestReading) return '-';
    if (selectedType === 'bp') return `${latestReading?.value?.systolic ?? '-'} / ${latestReading?.value?.diastolic ?? '-'}`;
    if (typeof latestReading?.value === 'number') return latestReading.value;
    return '-';
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Vitals Tracker</h2>
            <p className="text-sm text-slate-500 mt-1">Track and monitor your health vitals</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Reading</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Readings', value: vitalsData?.length || 0 },
            { label: 'Latest', value: renderLatestValue() },
            { label: 'Average', value: getAverageReading() || '-' },
            { label: 'Abnormal Readings', value: getAbnormalCount(), highlight: getAbnormalCount() > 0 },
          ].map((card) => (
            <div key={card.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.highlight ? 'text-red-500' : 'text-slate-900'}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Vital Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              {vitalsTypes.map(type => (
                <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Time Range:</span>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <VitalsChart data={vitalsData} type={selectedType} onAnalyze={handleAnalyzeTrend} />

          {/* Analyzing state */}
          {analyzing && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center gap-3 text-blue-600">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium">Analyzing your trends with Gemini...</span>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && !analyzing && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900">Health Insight</h3>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{analysis}</p>
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