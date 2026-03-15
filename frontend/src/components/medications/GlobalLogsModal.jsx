import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import medicationService from '../../services/medicationService';
import toast from 'react-hot-toast';

const GlobalLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState('all');
  const [members, setMembers] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchFamilyMembers();
      fetchLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [selectedMember, dateRange.startDate, dateRange.endDate]);

  const fetchFamilyMembers = async () => {
    try {
      const response = await medicationService.getFamilyMembers();
      setMembers(response?.family?.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        member: selectedMember === 'all' ? undefined : selectedMember
      };
      const response = await medicationService.getAllLogs(params);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load medication logs');
    } finally {
      setLoading(false);
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

  const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)} at ${timeString}`;
  };

  const formatTakenTime = (takenAt) => {
    if (!takenAt) return '-';
    const date = new Date(takenAt);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      taken: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      skipped: 'bg-yellow-100 text-yellow-800',
      late: 'bg-orange-100 text-orange-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-6xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Family Medication Logs</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Members</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>

        {/* Logs */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-gray-200">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taken At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taken By</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">

                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">

                        <td className="px-6 py-4 text-sm">
                          {formatDateTime(log.scheduledDate, log.scheduledTime)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(log.userId?.name)}
                            </div>
                            <span className="ml-2 text-sm">
                              {log.userId?.name || 'Unknown'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          {log.medicineName}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {log.dosage?.value} {log.dosage?.unit}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {log.takenAt ? formatTakenTime(log.takenAt) : '-'}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {log.takenBy?.name || log.userId?.name || '-'}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No medication logs found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">

          <span className="text-sm">
            Total Logs: <strong>{logs.length}</strong>
          </span>

          <div className="flex gap-4 text-sm">
            <span className="text-green-600">Taken: {logs.filter(l => l.status === 'taken').length}</span>
            <span className="text-red-600">Missed: {logs.filter(l => l.status === 'missed').length}</span>
            <span className="text-orange-600">Late: {logs.filter(l => l.status === 'late').length}</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default GlobalLogsModal;