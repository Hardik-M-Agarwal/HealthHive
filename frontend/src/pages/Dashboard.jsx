import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import DashboardView from '../components/dashboard/DashboardView';
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
      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0' 
      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0';
  };

  const pageTitles = {
    dashboard: 'Family Dashboard',
    members: 'Family Members',
    medications: 'Medications',
    vitals: 'Vitals Tracker',
    appointments: 'Appointments',
    'health-reports': 'Health Reports',
    prescriptions: 'Prescriptions',
    documents: 'Medical Documents'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-white font-medium">Loading your family dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        familyCode={familyDetails?.familyCode}
        familyName={familyDetails?.familyName}
      />

      <div className="flex-1 overflow-auto">
        {/* Premium Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {pageTitles[activeTab] || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'dashboard' ? 'Your family health at a glance' : 
                   activeTab === 'members' ? `Manage your ${familyDetails?.familyName} family members` :
                   activeTab === 'medications' ? 'Track and manage medications' :
                   activeTab === 'vitals' ? 'Monitor health vitals' :
                   activeTab === 'appointments' ? 'Schedule and manage appointments' :
                   'Your central health repository'}
                </p>
              </div>
              
              {/* Premium Notification Bell */}
              <button className="relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 group">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Premium Family Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{familyDetails?.familyName}</h2>
                    <p className="text-blue-100 mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {familyMembers.length} {familyMembers.length === 1 ? 'Member' : 'Members'} • Active Family
                    </p>
                  </div>
                  {user?.role === 'admin' && (
                    <button className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 border border-white/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Invite Member</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Premium Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {familyMembers.map((member, index) => (
                  <div 
                    key={member._id} 
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur"></div>
                    
                    <div className="relative bg-white rounded-2xl m-px overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Premium Avatar */}
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform group-hover:rotate-6 transition-all duration-500">
                              {getInitials(member.name)}
                            </div>
                            {member.role === 'admin' && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Member details */}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 break-all">{member.email}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-3 ${getRoleBadgeColor(member.role)} shadow-sm`}>
                              {member.role === 'admin' ? '👑 Family Admin' : '👤 Member'}
                            </span>
                          </div>
                        </div>

                        {/* Premium Action Button */}
                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="text-sm font-medium flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Member Card */}
              {user?.role === 'admin' && (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 group-hover:text-purple-600">Add New Member</h3>
                  <p className="text-sm text-gray-400 mt-1">Invite someone to join your family</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'medications' && <MedicationsView />}
          {activeTab === 'vitals' && <VitalsView />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'health-reports' && <HealthReportsView />}
          {activeTab === 'prescriptions' && <PrescriptionsView />}
          {activeTab === 'documents' && <DocumentsView />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;