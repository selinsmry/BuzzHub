import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminSidebar({ activeTab, setActiveTab, setSidebarOpen, onLogout }) {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard'},
    { id: 'users', label: 'Users' },
    { id: 'communities', label: 'Communities' },
    { id: 'posts', label: 'Posts' },
    { id: 'moderation', label: 'Moderation' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="p-6">
      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="my-6 border-t border-gray-700/50"></div>

      {/* Additional Actions */}
      <div className="space-y-2">
        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-all duration-200">
          <span className="text-xl">🏠</span>
          <span className="font-medium">Home</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all duration-200">
          <span className="text-xl"></span>
          <span className="font-medium">Mobile View</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all duration-200">
          <span className="text-xl"></span>
          <span className="font-medium">Analytics</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200">
          <span className="text-xl"></span>
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
        <p className="text-xs text-gray-400 mb-2">Admin Panel v1.0</p>
        <p className="text-xs text-gray-500">Last updated: Today</p>
      </div>
    </div>
  );
}

export default AdminSidebar;