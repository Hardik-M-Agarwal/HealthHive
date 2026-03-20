import React from 'react';

const UpcomingEvents = ({ upcoming }) => {
  if (!upcoming || !upcoming.events || upcoming.events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
        <p className="text-gray-500 text-center py-4">No upcoming events scheduled 🎉</p>
      </div>
    );
  }

  const getDaysText = (daysUntil) => {
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil === 2) return 'In 2 days';
    if (daysUntil === 3) return 'In 3 days';
    return `In ${daysUntil} days`;
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'appointment': return '🏥';
      case 'refill': return '💊';
      default: return '📅';
    }
  };

  // Group by days
  const grouped = {
    tomorrow: upcoming.events.filter(e => e.daysUntil === 1),
    in2Days: upcoming.events.filter(e => e.daysUntil === 2),
    in3Days: upcoming.events.filter(e => e.daysUntil === 3),
    later: upcoming.events.filter(e => e.daysUntil > 3)
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
      <div className="space-y-4">
        {grouped.tomorrow.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">TOMORROW</p>
            <div className="space-y-2">
              {grouped.tomorrow.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.member} – {event.title}
                    </p>
                    {event.time && (
                      <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {grouped.in2Days.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">IN 2 DAYS</p>
            <div className="space-y-2">
              {grouped.in2Days.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.member} – {event.title}
                    </p>
                    {event.time && (
                      <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {grouped.in3Days.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">IN 3 DAYS</p>
            <div className="space-y-2">
              {grouped.in3Days.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.member} – {event.title}
                    </p>
                    {event.time && (
                      <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {grouped.later.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">LATER</p>
            <div className="space-y-2">
              {grouped.later.slice(0, 2).map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <span className="text-xl">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.member} – {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcoming.events.length > 5 && (
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 mt-2">
            See all upcoming events →
          </button>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;