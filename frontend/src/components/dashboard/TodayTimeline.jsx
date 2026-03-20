import React from 'react';

const TodayTimeline = ({ timeline }) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'taken':
        return { icon: '✅', text: 'Taken', color: 'text-green-600 bg-green-50' };
      case 'missed':
        return { icon: '❌', text: 'Missed', color: 'text-red-600 bg-red-50' };
      case 'pending':
        return { icon: '⏳', text: 'Pending', color: 'text-yellow-600 bg-yellow-50' };
      case 'upcoming':
        return { icon: '🏥', text: 'Upcoming', color: 'text-blue-600 bg-blue-50' };
      default:
        return { icon: '📋', text: status, color: 'text-gray-600 bg-gray-50' };
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Timeline</h3>
        <p className="text-gray-500 text-center py-8">No events scheduled for today ✨</p>
      </div>
    );
  }

  // Group by time
  const grouped = timeline.reduce((acc, event) => {
    if (!acc[event.time]) acc[event.time] = [];
    acc[event.time].push(event);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Timeline</h3>
      <div className="space-y-4">
        {Object.entries(grouped).map(([time, events]) => (
          <div key={time}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-20 text-sm font-medium text-gray-500">{time}</div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            {events.map((event, idx) => {
              const badge = getStatusBadge(event.status);
              return (
                <div key={idx} className="ml-20 mb-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <span className="text-sm">{badge.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {event.member} {event.action} {event.medicine || event.doctor}
                      </p>
                      {event.dosage && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.dosage.value} {event.dosage.unit}</p>
                      )}
                      {event.clinic && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.clinic}</p>
                      )}
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    {event.status === 'pending' && (
                      <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Mark Taken
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayTimeline;