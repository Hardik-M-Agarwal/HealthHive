import React from 'react';

const MedicationRing = ({ ring }) => {
  if (!ring) return null;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - ring.adherence / 100);

  const getRingColor = () => {
    if (ring.adherence >= 80) return 'stroke-green-500';
    if (ring.adherence >= 50) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Today's Medication Adherence</h3>
      
      <div className="flex flex-col items-center">
        {/* Circular Ring */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="96"
              cy="96"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${getRingColor()} transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{ring.adherence}%</span>
            <span className="text-xs text-gray-500 mt-1">Adherence</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{ring.taken}</p>
            <p className="text-xs text-gray-500">Taken</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{ring.missed}</p>
            <p className="text-xs text-gray-500">Missed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{ring.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Affects {ring.affectedMembers} family members</p>
      </div>
    </div>
  );
};

export default MedicationRing;