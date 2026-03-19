import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, onTabChange, familyCode, familyName }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'members',
      label: 'Family Members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-purple-600 to-pink-500'
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-600 to-red-500',
      disabled: false // Enabled now
    },
    {
      id: 'vitals',
      label: 'Vitals Tracker',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'from-green-600 to-emerald-500',
      disabled: false
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-purple-600 to-indigo-600',
      disabled: false
    },
    {
      id: 'health-reports',
      label: 'Health Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-600 to-cyan-500',
      disabled: false
    },
    {
      id: 'documents',
      label: 'Medical Documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-blue-600 to-cyan-500',
      disabled: false
    },
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white shadow-2xl transition-all duration-300 flex flex-col relative h-screen sticky top-0`}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-all border border-gray-200 z-10"
      >
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                FamilyHealth
              </span>
              <span className="block text-xs text-gray-500">Portal</span>
            </div>
          )}
        </div>

        {/* Family Code - Only show when expanded */}
        {!collapsed && familyCode && (
          <div className="mt-4 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Family Code</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-gray-700">{familyCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(familyCode)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Copy code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onTabChange(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-xl transition-all duration-200 relative group ${activeTab === item.id
                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                : item.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="font-medium flex-1 text-left">{item.label}</span>
              )}
              {item.disabled && !collapsed && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                  Soon
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && !item.disabled && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {getInitials(user?.name || 'User')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`mt-3 w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-2'} px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}

          {/* Tooltip for collapsed mode */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;