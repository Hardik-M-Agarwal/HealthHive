import React from 'react';

const ReportDetailModal = ({ isOpen, onClose, report, onArchive, onDelete }) => {
  if (!isOpen || !report) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTestTypeLabel = (type) => {
    const labels = { blood: 'Blood Test', urine: 'Urine Test', imaging: 'Imaging', pathology: 'Pathology', other: 'Other' };
    return labels[type] || 'Other';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900 bg-opacity-60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-white">Report Details</h3>
                <p className="text-sm text-blue-100 truncate">{report.fileName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            {[
              { label: 'Report Type', value: getTestTypeLabel(report.testType) },
              { label: 'Uploaded On', value: formatDate(report.createdAt) },
              { label: 'File Type', value: report.fileType?.toUpperCase() },
              { label: 'Status', value: report.isArchived ? 'Archived' : 'Active' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Simplified Explanation */}
          <div className="mb-6">
            <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              Simplified Explanation
            </h4>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <p className="text-slate-800 leading-relaxed text-sm">{report.simplifiedExplanation}</p>
            </div>
          </div>

          {/* Abnormal Markers */}
          {report.abnormalMarkers?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                Abnormal Markers
                <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-1">
                  {report.abnormalMarkers.length} found
                </span>
              </h4>
              <div className="space-y-3">
                {report.abnormalMarkers.map((marker, index) => (
                  <div key={index} className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-slate-900">{marker.marker}</h5>
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium flex-shrink-0 ml-2">
                        Abnormal
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Your Value</p>
                        <p className="font-semibold text-red-600">{marker.value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Normal Range</p>
                        <p className="font-medium text-slate-700">{marker.normalRange}</p>
                      </div>
                    </div>
                    {marker.interpretation && (
                      <p className="text-sm text-slate-600 bg-white/60 p-2 rounded-lg">{marker.interpretation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All clear */}
          {(!report.abnormalMarkers || report.abnormalMarkers.length === 0) && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-sm">No abnormal markers detected in this report.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={onArchive}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>{report.isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;