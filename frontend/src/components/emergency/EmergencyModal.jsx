import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import emergencyService from '../../services/emergencyService';
import toast from 'react-hot-toast';

const EmergencyModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [emergencyType, setEmergencyType] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState(null);
  const { user } = useAuth();

  const emergencyTypes = [
    { value: 'medical', label: '🚑 Medical Emergency', color: 'red' },
    { value: 'fire', label: '🔥 Fire Emergency', color: 'orange' },
    { value: 'accident', label: '⚠️ Accident', color: 'yellow' },
    { value: 'security', label: '🛡️ Security Alert', color: 'purple' },
    { value: 'other', label: '🚨 Other Emergency', color: 'gray' }
  ];

  const getLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
      // Still proceed without location
      proceedToNext();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const locationLink = `https://maps.google.com/?q=${lat},${lng}`;
        
        setLocation({
          lat,
          lng,
          locationLink
        });
        
        setGettingLocation(false);
        proceedToNext();
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Proceeding without it.');
        setGettingLocation(false);
        proceedToNext();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const proceedToNext = () => {
    setStep(2);
  };

  const handleSendAlert = async () => {
    try {
      setSending(true);

      const emergencyData = {
        emergencyType: emergencyType || 'other',
        customMessage: customMessage || '',
        location: location || null
      };

      await emergencyService.triggerEmergency(emergencyData);
      
      toast.success('🚨 Emergency alert sent to all family members!');
      setStep(3); // Show success screen
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error('Failed to send emergency alert. Please try again or call for help directly.');
    } finally {
      setSending(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setEmergencyType('');
    setCustomMessage('');
    setLocation(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={resetModal}></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
          
          {/* Emergency Header - Always Red */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">EMERGENCY ALERT</h3>
                  <p className="text-sm text-red-100">This will notify all family members</p>
                </div>
              </div>
              <button onClick={resetModal} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step 1: Get Location */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Getting Your Location</h4>
                <p className="text-sm text-gray-600 mb-4">
                  We need your location to share with family members
                </p>
                <button
                  onClick={getLocation}
                  disabled={gettingLocation}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {gettingLocation ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    'Allow Location Access'
                  )}
                </button>
                <button
                  onClick={proceedToNext}
                  className="w-full mt-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Skip location (not recommended)
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Emergency Details */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              {/* Location Preview if available */}
              {location && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-700">Location captured successfully</span>
                  <a 
                    href={location.locationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-blue-600 hover:underline"
                  >
                    View Map
                  </a>
                </div>
              )}

              {/* Emergency Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Type <span className="text-gray-400">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setEmergencyType(type.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        emergencyType === type.value
                          ? `border-${type.color}-600 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg mb-1 block">{type.label.split(' ')[0]}</span>
                      <span className="text-xs font-medium">{type.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Any additional information that might help..."
                  maxLength="200"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {customMessage.length}/200
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSendAlert}
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending Alert...</span>
                    </>
                  ) : (
                    '🚨 SEND EMERGENCY ALERT'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="p-6 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Alert Sent Successfully!</h4>
                <p className="text-gray-600">
                  All family members have been notified of your emergency.
                </p>
                {location && (
                  <a 
                    href={location.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Your Location on Maps
                  </a>
                )}
              </div>
              <button
                onClick={resetModal}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmergencyModal;