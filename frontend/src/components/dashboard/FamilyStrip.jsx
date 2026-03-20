import React from 'react';

const FamilyStrip = ({ familyStrip, onSelectMember }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'ring-4 ring-red-500 ring-offset-2';
      case 'warning': return 'ring-4 ring-yellow-500 ring-offset-2';
      default: return 'ring-4 ring-green-500 ring-offset-2';
    }
  };

  const getStatusIcon = (statusIcon) => {
    return statusIcon;
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2 min-w-max">
          {familyStrip.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className="flex-shrink-0 w-24 text-center group"
            >
              <div className={`relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform group-hover:scale-105 ${getStatusColor(member.status)}`}>
                {member.initial}
                <span className="absolute -top-1 -right-1 text-xl">{getStatusIcon(member.statusIcon)}</span>
              </div>
              <p className="font-medium text-gray-900 mt-2">{member.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.statusText}</p>
              {member.role === 'admin' && (
                <span className="text-[10px] text-gray-400">Admin</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyStrip;