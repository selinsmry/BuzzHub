import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'BuzzHub',
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxPostsPerDay: 50,
    maxCommunitiesPerUser: 10,
    postMinCharacters: 10,
    postMaxCharacters: 5000,
    commentMinCharacters: 1,
    commentMaxCharacters: 1000,
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage since backend doesn't have settings endpoint
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure platform settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2 flex items-center space-x-2 shadow-xl overflow-x-auto">
        {['general', 'content', 'security', 'email', 'api'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30 text-white' : 'hover:bg-gray-700/50 text-gray-300'
            }`}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">General Settings</h2>

          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Maintenance Mode</p>
              <p className="text-gray-400 text-sm">Enable to temporarily disable site for maintenance</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                className="hidden"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-gray-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
              </div>
            </label>
          </div>

          {/* Allow New Registrations */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Allow New Registrations</p>
              <p className="text-gray-400 text-sm">Allow users to create new accounts</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) => handleSettingChange('allowNewRegistrations', e.target.checked)}
                className="hidden"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${settings.allowNewRegistrations ? 'bg-green-500' : 'bg-gray-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.allowNewRegistrations ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Content Settings */}
      {activeTab === 'content' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">Content Settings</h2>

          {/* Max Posts Per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Posts Per Day Per User</label>
            <input
              type="number"
              value={settings.maxPostsPerDay}
              onChange={(e) => handleSettingChange('maxPostsPerDay', parseInt(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Max Communities Per User */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Communities Per User</label>
            <input
              type="number"
              value={settings.maxCommunitiesPerUser}
              onChange={(e) => handleSettingChange('maxCommunitiesPerUser', parseInt(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Post Character Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Post Min Characters</label>
              <input
                type="number"
                value={settings.postMinCharacters}
                onChange={(e) => handleSettingChange('postMinCharacters', parseInt(e.target.value))}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Post Max Characters</label>
              <input
                type="number"
                value={settings.postMaxCharacters}
                onChange={(e) => handleSettingChange('postMaxCharacters', parseInt(e.target.value))}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Comment Character Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Comment Min Characters</label>
              <input
                type="number"
                value={settings.commentMinCharacters}
                onChange={(e) => handleSettingChange('commentMinCharacters', parseInt(e.target.value))}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Comment Max Characters</label>
              <input
                type="number"
                value={settings.commentMaxCharacters}
                onChange={(e) => handleSettingChange('commentMaxCharacters', parseInt(e.target.value))}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">Security Settings</h2>

          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/30 text-sm font-medium text-left">
              🔒 Enable Two-Factor Authentication
            </button>
            <button className="w-full px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/30 text-sm font-medium text-left">
              🔑 Reset Admin Password
            </button>
            <button className="w-full px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors border border-orange-500/30 text-sm font-medium text-left">
              📋 View Security Log
            </button>
            <button className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/30 text-sm font-medium text-left">
              🚨 Security Audit
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">Email Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Server</label>
              <input
                type="text"
                placeholder="smtp.example.com"
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                <input
                  type="number"
                  placeholder="587"
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
                <input
                  type="email"
                  placeholder="noreply@buzzhub.com"
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors border border-green-500/30 text-sm font-medium">
              Test Email Configuration
            </button>
          </div>
        </div>
      )}

      {/* API Settings */}
      {activeTab === 'api' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">API Settings</h2>

          <div className="space-y-4">
            <div>
              <p className="text-white font-medium mb-2">API Keys</p>
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-300 text-sm">Production Key</p>
                    <p className="text-gray-500 text-xs mt-1">sk_live_•••••••••••••••••••</p>
                  </div>
                  <button className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-xs font-medium">
                    Rotate
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-white font-medium mb-2">Rate Limiting</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requests per minute</label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Requests per hour</label>
                  <input
                    type="number"
                    defaultValue="10000"
                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 rounded-xl transition-all font-medium border border-gray-700/50">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AdminSettings;
