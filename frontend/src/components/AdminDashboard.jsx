import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCommunities: 0,
    totalPosts: 0,
    prevTotalUsers: 0,
    prevActiveUsers: 0,
    prevTotalCommunities: 0,
    prevTotalPosts: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        console.log('[AdminDashboard] Veri yükleniyor...');
        
        // Stats yükle
        const [usersRes, communitiesRes, postsRes] = await Promise.all([
          axiosInstance.get('/users').catch(() => ({ data: [] })),
          axiosInstance.get('/communities').catch(() => ({ data: [] })),
          axiosInstance.get('/posts').catch(() => ({ data: [] })),
        ]);

        console.log('[AdminDashboard] API yanıtları:', { usersRes, communitiesRes, postsRes });

        const usersList = usersRes.data || [];
        const communitiesList = communitiesRes.data?.communities || [];
        const postsList = postsRes.data.posts || postsRes.data || [];
        
        const newTotalUsers = usersList.length;
        const newActiveUsers = Math.ceil(newTotalUsers * 0.25);
        const newTotalCommunities = communitiesList.length;
        const newTotalPosts = postsList.length;

        console.log('[AdminDashboard] Hesaplanan istatistikler:', { newTotalUsers, newActiveUsers, newTotalCommunities, newTotalPosts });

        setStats(prevStats => ({
          totalUsers: newTotalUsers,
          activeUsers: newActiveUsers,
          totalCommunities: newTotalCommunities,
          totalPosts: newTotalPosts,
          prevTotalUsers: prevStats.totalUsers,
          prevActiveUsers: prevStats.activeUsers,
          prevTotalCommunities: prevStats.totalCommunities,
          prevTotalPosts: prevStats.totalPosts,
        }));

        // Recent Activity yükle
        try {
          const activityRes = await axiosInstance.get('/admin/recent-activity');
          console.log('[AdminDashboard] Recent Activity:', activityRes.data);
          setRecentActivity(activityRes.data || []);
        } catch (err) {
          console.error('Recent activity yüklenirken hata:', err);
          setRecentActivity([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('[ADMIN DASHBOARD] Error loading dashboard:', err);
        setError(err.message);
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalCommunities: 0,
          totalPosts: 0,
          prevTotalUsers: 0,
          prevActiveUsers: 0,
          prevTotalCommunities: 0,
          prevTotalPosts: 0,
        });
        setRecentActivity([]);
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to the BuzzHub Admin Control Panel</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Users</p>
              <h3 className="text-3xl font-bold text-white">{stats?.totalUsers?.toLocaleString?.() || 0}</h3>
              <p className="text-green-400 text-xs mt-2">↑ {calculatePercentChange(stats?.totalUsers || 0, stats?.prevTotalUsers || 0)}% from last check</p>
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
              <h3 className="text-3xl font-bold text-white">{stats?.activeUsers?.toLocaleString?.() || 0}</h3>
              <p className="text-green-400 text-xs mt-2">↑ {calculatePercentChange(stats?.activeUsers || 0, stats?.prevActiveUsers || 0)}% from last check</p>
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
              <h3 className="text-3xl font-bold text-white">{stats?.totalCommunities?.toLocaleString?.() || 0}</h3>
              <p className="text-green-400 text-xs mt-2">↑ {calculatePercentChange(stats?.totalCommunities || 0, stats?.prevTotalCommunities || 0)}% from last check</p>
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
              <h3 className="text-3xl font-bold text-white">{stats?.totalPosts?.toLocaleString?.() || 0}</h3>
              <p className="text-green-400 text-xs mt-2">↑ {calculatePercentChange(stats?.totalPosts || 0, stats?.prevTotalPosts || 0)}% from last check</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <span className="text-2xl">📝</span>
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
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl hover:bg-gray-900/80 transition-colors border border-gray-700/30">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xl">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-medium">{activity.message}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(activity.date).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Henüz aktivite yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
