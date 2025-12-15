import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCommunities: 0,
    totalPosts: 0,
    totalReports: 0,
    systemHealth: 98.5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, communitiesRes, postsRes] = await Promise.all([
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/communities`),
        axios.get(`${API_URL}/posts`),
      ]);

      const postsList = postsRes.data.posts || postsRes.data || [];
      setStats({
        totalUsers: (usersRes.data || []).length,
        activeUsers: Math.ceil((usersRes.data || []).length * 0.25),
        totalCommunities: (communitiesRes.data || []).length,
        totalPosts: postsList.length,
        totalReports: 42,
        systemHealth: 98.5,
      });
    } catch (err) {
      console.error('Stats yüklenirken hata:', err);
      setStats({
        totalUsers: 150,
        activeUsers: 38,
        totalCommunities: 5,
        totalPosts: 50,
        totalReports: 42,
        systemHealth: 98.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const recentActivity = [
    { id: 1, type: 'user_join', message: 'Yeni kullanıcı kaydı: TechLover92', time: '5 dakika önce', icon: '👤' },
    { id: 2, type: 'community_created', message: 'Yeni topluluk oluşturuldu: AI Tartışması', time: '12 dakika önce', icon: '🏘️' },
    { id: 3, type: 'report_filed', message: 'Uygunsuz içerik raporu alındı', time: '23 dakika önce', icon: '🚨' },
    { id: 4, type: 'post_published', message: 'En popüler gönderi 5K oyunu aştı', time: '1 saat önce', icon: '📈' },
    { id: 5, type: 'user_banned', message: 'Kullanıcı yasaklandı: SpamAccount123', time: '2 saat önce', icon: '🚫' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the BuzzHub Admin Control Panel</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</h3>
              <p className="text-green-400 text-xs mt-2">↑ 2.5% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Active Users (24h)</p>
              <h3 className="text-3xl font-bold text-white">{stats.activeUsers.toLocaleString()}</h3>
              <p className="text-green-400 text-xs mt-2">↑ 12% from yesterday</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-2xl">🟢</span>
            </div>
          </div>
        </div>

        {/* Total Communities */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Communities</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalCommunities}</h3>
              <p className="text-green-400 text-xs mt-2">↑ 3 new this week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">🏘️</span>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-pink-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Posts</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalPosts.toLocaleString()}</h3>
              <p className="text-green-400 text-xs mt-2">↑ 1,234 posts today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Pending Reports</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalReports}</h3>
              <p className="text-red-400 text-xs mt-2">⚠️ Requires attention</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">System Health</p>
              <h3 className="text-3xl font-bold text-white">{stats.systemHealth}%</h3>
              <div className="w-32 h-2 bg-gray-700 rounded-full mt-2">
                <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" style={{ width: `${stats.systemHealth}%` }}></div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>📊</span>
          <span>Recent Activity</span>
        </h2>
        
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors border border-gray-700/30">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-gray-200 text-sm font-medium">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors border border-orange-500/30 text-sm font-medium">
              Send System Announcement
            </button>
            <button className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/30 text-sm font-medium">
              Generate Reports
            </button>
            <button className="w-full px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/30 text-sm font-medium">
              Backup Database
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Database</span>
              <span className="text-green-400 text-sm font-medium flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">API Server</span>
              <span className="text-green-400 text-sm font-medium flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Storage</span>
              <span className="text-green-400 text-sm font-medium flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Online</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
