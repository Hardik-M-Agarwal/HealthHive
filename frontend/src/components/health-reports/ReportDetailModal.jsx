import React from 'react';

const ReportDetailModal = ({ isOpen, onClose, report, onArchive, onDelete }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestTypeLabel = (type) => {
    const labels = {
      blood: 'Blood Test',
      urine: 'Urine Test',
      imaging: 'Imaging',
      pathology: 'Pathology',
      other: 'Other'
    };
    return labels[type] || 'Other';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Report Details</h3>
                  <p className="text-sm text-blue-100">{report.fileName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Report Type</p>
                <p className="text-sm font-medium text-gray-900">{getTestTypeLabel(report.testType)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Uploaded On</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">File Type</p>
                <p className="text-sm font-medium text-gray-900 uppercase">{report.fileType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  {report.isArchived ? 'Archived' : 'Active'}
                </p>
              </div>
            </div>

            {/* Simplified Explanation */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                Simplified Explanation
              </h4>
              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <p className="text-gray-800 leading-relaxed">
                  {report.simplifiedExplanation}
                </p>
              </div>
            </div>

            {/* Abnormal Markers */}
            {report.abnormalMarkers?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                  Abnormal Markers
                </h4>
                <div className="space-y-3">
                  {report.abnormalMarkers.map((marker, index) => (
                    <div key={index} className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{marker.marker}</h5>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Abnormal
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-xs text-gray-500">Your Value</p>
                          <p className="font-medium text-red-600">{marker.value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Normal Range</p>
                          <p className="font-medium text-gray-700">{marker.normalRange}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded-lg">
                        {marker.interpretation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Abnormal Markers */}
            {(!report.abnormalMarkers || report.abnormalMarkers.length === 0) && (
              <div className="mb-6 p-5 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">No abnormal markers detected in this report.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={onArchive}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>{report.isArchived ? 'Unarchive' : 'Archive'}</span>
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;