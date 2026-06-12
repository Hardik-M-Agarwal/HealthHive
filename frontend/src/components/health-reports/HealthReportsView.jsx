import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import healthReportService from '../../services/healthReportService';
import UploadReportModal from './UploadReportModal';
import ReportDetailModal from './ReportDetailModal';
import toast from 'react-hot-toast';

const HealthReportsView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => { fetchReports(); }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'archived') params.archived = 'true';
      const response = await healthReportService.getReports(params);
      setReports(response.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const response = await healthReportService.uploadReport(file);
      toast.success('Report uploaded and analyzed successfully!');
      setReports(prev => [response.report, ...prev]);
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error(error.response?.data?.message || 'Failed to upload report');
      throw error;
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleToggleArchive = async (report) => {
    try {
      await healthReportService.toggleArchive(report._id);
      toast.success(report.isArchived ? 'Report unarchived' : 'Report archived');
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      await healthReportService.deleteReport(reportId);
      toast.success('Report deleted successfully');
      setReports(prev => prev.filter(r => r._id !== reportId));
      if (selectedReport?._id === reportId) {
        setShowDetailModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTestTypeIcon = (type) => {
    const icons = { blood: '🩸', urine: '💧', imaging: '📷', pathology: '🔬', other: '📄' };
    return icons[type] || '📄';
  };

  const getTestTypeLabel = (type) => {
    const labels = { blood: 'Blood Test', urine: 'Urine Test', imaging: 'Imaging', pathology: 'Pathology', other: 'Other' };
    return labels[type] || 'Other';
  };

  // Trim long filenames for display
  const trimFileName = (name) => {
    if (!name) return 'Report';
    // Remove extension
    const withoutExt = name.replace(/\.[^/.]+$/, '');
    // If too long, truncate
    return withoutExt.length > 30 ? withoutExt.substring(0, 30) + '...' : withoutExt;
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
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Health Reports</h2>
            <p className="text-sm text-slate-500 mt-1">Upload and simplify your medical reports</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Report</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['all', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All Reports' : 'Archived'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => handleViewReport(report)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Card top accent */}
              <div className="h-1 w-full bg-blue-600" />

              <div className="p-5">
                {/* Icon + type + date row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {getTestTypeIcon(report.testType)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {getTestTypeLabel(report.testType)}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(report.reportDate || report.createdAt)}</p>
                  </div>
                  {report.isArchived && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium flex-shrink-0">
                      Archived
                    </span>
                  )}
                </div>

                {/* Filename */}
                <h3 className="font-semibold text-slate-900 text-sm mb-2 truncate" title={report.fileName}>
                  {trimFileName(report.fileName)}
                </h3>

                {/* Explanation preview */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {report.simplifiedExplanation}
                </p>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  {report.abnormalMarkers?.length > 0 ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {report.abnormalMarkers.length} abnormal {report.abnormalMarkers.length === 1 ? 'marker' : 'markers'}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      All normal
                    </div>
                  )}
                  <span className="text-xs text-slate-400">View details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Reports Found</h3>
          <p className="text-slate-500 text-sm mb-5">Upload your first health report to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
          >
            Upload Report
          </button>
        </div>
      )}

      <UploadReportModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {selectedReport && (
        <ReportDetailModal
          isOpen={showDetailModal}
          onClose={() => { setShowDetailModal(false); setSelectedReport(null); }}
          report={selectedReport}
          onArchive={() => handleToggleArchive(selectedReport)}
          onDelete={() => handleDelete(selectedReport._id)}
        />
      )}
    </div>
  );
};

export default HealthReportsView;