import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import MedicationsView from '../components/medications/MedicationsView';
import VitalsView from '../components/vitals/VitalsView';
import AppointmentsView from '../components/appointments/AppointmentsView';
import HealthReportsView from '../components/health-reports/HealthReportsView';
import DocumentsView from '../components/documents/DocumentsView';
import toast from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyDetails, setFamilyDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch family members
  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/family/${user.familyId}`);
        console.log('Family data:', response.data);

        setFamilyDetails(response.data.family);
        setFamilyMembers(response.data.family.members || []);
      } catch (error) {
        console.error('Error fetching family data:', error);
        toast.error('Failed to load family members');
      } finally {
        setLoading(false);
      }
    };

    if (user?.familyId) {
      fetchFamilyData();
    }
  }, [user]);

  // Redirect if not authenticated or no family
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.familyId) {
      navigate('/family-choice');
    } else if (!user.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your family dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        familyCode={familyDetails?.familyCode}
        familyName={familyDetails?.familyName}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' ? 'Dashboard' :
                  activeTab === 'members' ? 'Family Members' :
                    activeTab === 'medications' ? 'Medications' :
                      activeTab === 'vitals' ? 'Vitals Tracker' :
                        activeTab === 'appointments' ? 'Appointments' :
                          activeTab === 'health-reports' ? 'Health Reports' :
                            activeTab === 'health-records' ? 'Health Records' :
                              activeTab === 'appointments' ? 'Appointments' : 'Dashboard'}
              </h1>

              {/* Notification Bell */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Render based on active tab */}
          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Family Dashboard!</h2>
              <p className="text-gray-600 mb-4">
                You're all set up with {familyMembers.length} family {familyMembers.length === 1 ? 'member' : 'members'}.
              </p>
              <p className="text-sm text-gray-500">
                More features coming soon: Health records, appointments, and more!
              </p>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Family Header */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{familyDetails?.familyName}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {familyMembers.length} {familyMembers.length === 1 ? 'Member' : 'Members'}
                    </p>
                  </div>

                  {/* Only show invite button for admin */}
                  {user?.role === 'admin' && (
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {familyMembers.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Avatar with gradient */}
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl transform group-hover:rotate-6 transition-transform">
                            {getInitials(member.name)}
                          </div>
                          {member.role === 'admin' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Member details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{member.email}</p>

                          {/* Role badge */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                            {member.role === 'admin' ? 'Family Admin' : 'Member'}
                          </span>
                        </div>
                      </div>

                      {/* Quick actions (hover effect) */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State (if no members) */}
              {familyMembers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                  <p className="text-gray-500">There was an error loading family members.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medications' && (
            <MedicationsView />
          )}

          {activeTab === 'vitals' && (
            <VitalsView />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView />
          )}

          {activeTab === 'health-reports' && (
            <HealthReportsView />
          )}

          {activeTab === 'documents' && (
            <DocumentsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;