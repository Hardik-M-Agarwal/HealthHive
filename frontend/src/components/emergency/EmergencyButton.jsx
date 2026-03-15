import React, { useState } from 'react';
import EmergencyModal from './EmergencyModal';

const EmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Simple floating button - no animations */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-colors duration-200"
        >
          {/* Emergency icon */}
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </button>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default EmergencyButton;