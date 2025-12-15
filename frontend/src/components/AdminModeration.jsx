import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    actionsThisWeek: 0,
    usersWarned: 0,
    usersBanned: 0,
    postsRemoved: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      const postsData = (response.data.posts || response.data || []).slice(0, 5);
      setPosts(postsData);
      
      // Calculate mock stats based on data
      setStats({
        actionsThisWeek: postsData.length * 2,
        usersWarned: Math.floor(Math.random() * 10),
        usersBanned: Math.floor(Math.random() * 5),
        postsRemoved: Math.floor(Math.random() * 15),
      });
    } catch (err) {
      console.error('Data yüklenirken hata:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi kaldırmak istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        data: { userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser'))._id : null }
      });
      setPosts(posts.filter(p => p._id !== postId));
      setStats({ ...stats, postsRemoved: stats.postsRemoved + 1 });
      alert('Gönderi kaldırıldı');
    } catch (err) {
      console.error('Hata:', err);
      alert('İşlem sırasında hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Moderation Center</h1>
        <p className="text-gray-400">Review and manage moderation actions</p>
      </div>

      {/* Recent Posts to Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>📋</span>
          <span>Recent Posts for Review</span>
        </h2>

        {posts.length > 0 ? posts.map((post) => (
          <div key={post._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-pink-500/20">
                  📝
                </div>
                <div>
                  <p className="text-white font-medium">{post.title}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{post.content || 'No content'}</p>
                  <p className="text-gray-500 text-xs mt-1">By {post.author || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  pending
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleRemovePost(post._id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Remove
              </button>
              <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                Approve
              </button>
              <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No posts to review</p>
          </div>
        )}
      </div>

      {/* Moderation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">🛠️ Moderation Tools</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/30 text-sm font-medium">
              Ban User
            </button>
            <button className="w-full px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/30 text-sm font-medium">
              Remove Post
            </button>
            <button className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors border border-orange-500/30 text-sm font-medium">
              Send Warning
            </button>
            <button className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors border border-green-500/30 text-sm font-medium">
              Approve Content
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">📊 Moderation Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Actions This Week</span>
              <span className="text-white font-bold">{stats.actionsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Warned</span>
              <span className="text-yellow-400 font-bold">{stats.usersWarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Banned</span>
              <span className="text-red-400 font-bold">{stats.usersBanned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Posts Removed</span>
              <span className="text-orange-400 font-bold">{stats.postsRemoved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModeration;
