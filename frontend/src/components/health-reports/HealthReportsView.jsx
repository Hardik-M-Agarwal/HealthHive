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
  const [filter, setFilter] = useState('all'); // all, archived
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'archived') {
        params.archived = 'true';
      }
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
      console.error('Error toggling archive:', error);
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
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTestTypeIcon = (type) => {
    const icons = {
      blood: '🩸',
      urine: '💧',
      imaging: '📷',
      pathology: '🔬',
      other: '📄'
    };
    return icons[type] || '📄';
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
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Health Reports</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload and simplify your medical reports
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Report</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'archived'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report._id}
              onClick={() => handleViewReport(report)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer group"
            >
              <div className="p-6">
                {/* Header with icon and date */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                      {getTestTypeIcon(report.testType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {report.fileName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(report.reportDate)}
                      </p>
                    </div>
                  </div>
                  {report.isArchived && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      Archived
                    </span>
                  )}
                </div>

                {/* Simplified explanation preview */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {report.simplifiedExplanation}
                </p>

                {/* Abnormal markers count */}
                {report.abnormalMarkers?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block">
                    <span className="font-bold">{report.abnormalMarkers.length}</span>
                    <span>abnormal {report.abnormalMarkers.length === 1 ? 'marker' : 'markers'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-500 mb-4">Upload your first health report to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Upload Report
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadReportModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          report={selectedReport}
          onArchive={() => handleToggleArchive(selectedReport)}
          onDelete={() => handleDelete(selectedReport._id)}
        />
      )}
    </div>
  );
};

export default HealthReportsView;