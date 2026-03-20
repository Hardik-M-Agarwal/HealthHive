import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import HeroSection from './HeroSection';
import FamilyStrip from './FamilyStrip';
import TodayTimeline from './TodayTimeline';
import MedicationRing from './MedicationRing';
import WhatsChanging from './WhatsChanging';
import UpcomingEvents from './UpcomingEvents';
import toast from 'react-hot-toast';

const DashboardView = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      setDashboard(response.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (memberId) => {
    // Navigate to member details or show modal
    toast.success(`Viewing ${memberId} details`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 1️⃣ Hero Section */}
      <HeroSection hero={dashboard.hero} />

      {/* 2️⃣ Family Strip */}
      <FamilyStrip 
        familyStrip={dashboard.familyStrip} 
        onSelectMember={handleSelectMember}
      />

      {/* 3️⃣ Today Timeline */}
      <TodayTimeline timeline={dashboard.timeline} />

      {/* 4️⃣ Medication Ring */}
      <MedicationRing ring={dashboard.medicationRing} />

      {/* 5️⃣ What's Changing */}
      <WhatsChanging insights={dashboard.whatsChanging} />

      {/* 6️⃣ Upcoming */}
      <UpcomingEvents upcoming={dashboard.upcoming} />
    </div>
  );
};

export default DashboardView;