import React from 'react';

const HeroSection = ({ hero }) => {
  if (!hero) return null;

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">{hero.message}</h2>
        <p className="text-gray-300 text-sm">Tap on any alert to take action</p>
      </div>

      {hero.details && hero.details.length > 0 && (
        <div className="mt-4 space-y-2">
          {hero.details.map((detail, idx) => (
            <div key={idx} className={`p-4 rounded-xl ${getUrgencyColor(detail.urgency)} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl font-bold">
                  {detail.member.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{detail.member}</p>
                  {detail.issues.map((issue, i) => (
                    <p key={i} className="text-sm text-gray-600">{issue}</p>
                  ))}
                </div>
              </div>
              <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSection;