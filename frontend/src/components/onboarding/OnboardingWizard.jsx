import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import onboardingService from '../../services/onboardingService';
import BasicInfo from './BasicInfo';
import Allergies from './Allergies';
import MedicalHistory from './MedicalHistory';
import EmergencyContacts from './EmergencyContacts';
import toast from 'react-hot-toast';

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 4;

  const handleNext = (data) => { setFormData({ ...formData, ...data }); setStep(step + 1); };
  const handleBack = () => setStep(step - 1);

  const handleComplete = async (data) => {
    const finalData = { ...formData, ...data };
    try {
      setLoading(true);
      await onboardingService.completeOnboarding(finalData);
      await refreshUser();
      toast.success('Onboarding completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <BasicInfo onNext={handleNext} defaultData={formData} />;
      case 2: return <Allergies onNext={handleNext} onBack={handleBack} defaultData={formData} />;
      case 3: return <MedicalHistory onNext={handleNext} onBack={handleBack} defaultData={formData} />;
      case 4: return <EmergencyContacts onBack={handleBack} defaultData={formData} onSubmitComplete={handleComplete} />;
      default: return null;
    }
  };

  const stepIcons = [
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, title: 'Basic Info' },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: 'Allergies' },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, title: 'Medical History' },
    { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, title: 'Emergency' }
  ];

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Health Profile</h1>
          <p className="text-slate-500">Help us personalize your family health experience</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {stepIcons.map((item, index) => (
              <div key={index} className="flex-1 relative">
                {index < totalSteps - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${
                    index + 1 < step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}></div>
                )}
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    index + 1 <= step
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}>
                    {index + 1 < step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : item.icon}
                  </div>
                  <span className={`text-xs font-medium mt-2 transition-colors duration-300 ${
                    index + 1 <= step ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-6 text-slate-700 font-medium">Saving your health information...</p>
              <p className="text-sm text-slate-400 mt-2">This will only take a moment</p>
            </div>
          ) : renderStep()}
        </div>

        {/* Save & Exit */}
        <div className="text-center mt-6">
          <button
            onClick={logout}
            className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Save & Continue Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;