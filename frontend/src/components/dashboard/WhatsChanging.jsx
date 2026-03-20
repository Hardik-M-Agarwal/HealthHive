import React from 'react';

const WhatsChanging = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Changing</h3>
        <p className="text-gray-500 text-center py-4">No significant changes detected this week 📊</p>
      </div>
    );
  }

  const getIcon = (type, direction) => {
    if (type === 'vitals') {
      return direction === 'up' ? '📈' : '📉';
    }
    if (type === 'adherence') {
      return direction === 'up' ? '📈' : '📉';
    }
    return '⚠️';
  };

  const getColor = (type, direction) => {
    if (type === 'vitals') {
      return direction === 'up' ? 'text-red-600' : 'text-green-600';
    }
    if (type === 'adherence') {
      return direction === 'up' ? 'text-green-600' : 'text-red-600';
    }
    return 'text-yellow-600';
  };

  const getBgColor = (type, direction) => {
    if (type === 'vitals') {
      return direction === 'up' ? 'bg-red-50' : 'bg-green-50';
    }
    if (type === 'adherence') {
      return direction === 'up' ? 'bg-green-50' : 'bg-red-50';
    }
    return 'bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Changing</h3>
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className={`p-4 rounded-xl ${getBgColor(insight.type, insight.direction)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getIcon(insight.type, insight.direction)}</span>
              <div className="flex-1">
                <p className={`font-semibold ${getColor(insight.type, insight.direction)}`}>
                  {insight.message}
                </p>
                {insight.details && (
                  <p className="text-sm text-gray-600 mt-1">{insight.details}</p>
                )}
                {insight.type === 'vitals' && insight.change && (
                  <p className="text-xs text-gray-500 mt-1">Change: {insight.change} points</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatsChanging;