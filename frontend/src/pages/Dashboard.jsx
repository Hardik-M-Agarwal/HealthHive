import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import DashboardView from '../components/dashboard/DashboardView';
import FamilyMembersView from '../components/members/FamilyMembersView';
import MedicationsView from '../components/medications/MedicationsView';
import VitalsView from '../components/vitals/VitalsView';
import AppointmentsView from '../components/appointments/AppointmentsView';
import HealthReportsView from '../components/health-reports/HealthReportsView';
import DocumentsView from '../components/documents/DocumentsView';
import ProfileView from '../components/profile/ProfileView';
import toast from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyDetails, setFamilyDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/family/${user.familyId}`);
        setFamilyDetails(response.data.family);
        setFamilyMembers(response.data.family.members || []);
      } catch (error) {
        console.error('Error fetching family data:', error);
        toast.error('Failed to load family members');
      } finally {
        setLoading(false);
      }
    };

    if (user?.familyId) fetchFamilyData();
  }, [user]);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (!user.familyId) navigate('/family-choice');
    else if (!user.onboardingCompleted) navigate('/onboarding');
  }, [user, navigate]);

  const pageTitles = {
    dashboard: 'Family Dashboard',
    members: 'Family Members',
    medications: 'Medications',
    vitals: 'Vitals Tracker',
    appointments: 'Appointments',
    'health-reports': 'Health Reports',
    prescriptions: 'Prescriptions',
    documents: 'Medical Documents',
    profile: 'My Profile',
  };

  const pageSubtitles = {
    dashboard: 'Your family health at a glance',
    members: `Manage your ${familyDetails?.familyName || ''} family members`,
    medications: 'Track and manage medications',
    vitals: 'Monitor health vitals',
    appointments: 'Schedule and manage appointments',
    'health-reports': 'Upload and simplify your medical reports',
    prescriptions: 'Your prescription records',
    documents: 'Your central health repository',
    profile: 'View and update your health profile',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        familyCode={familyDetails?.familyCode}
        familyName={familyDetails?.familyName}
      />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-100">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {pageTitles[activeTab] || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {pageSubtitles[activeTab] || ''}
                </p>
              </div>

              {/* Notification bell */}
              <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'members' && (
            <FamilyMembersView
              familyMembers={familyMembers}
              familyDetails={familyDetails}
            />
          )}
          {activeTab === 'medications' && <MedicationsView />}
          {activeTab === 'vitals' && <VitalsView />}
          {activeTab === 'appointments' && <AppointmentsView />}
          {activeTab === 'health-reports' && <HealthReportsView />}
          {activeTab === 'documents' && <DocumentsView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;