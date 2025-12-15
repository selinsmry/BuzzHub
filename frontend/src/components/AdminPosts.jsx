import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data.posts || response.data || []);
    } catch (err) {
      console.error('Gönderiler yüklenirken hata:', err);
      setPosts([
        { id: 1, title: 'Yeni AI modeli GPT-5 duyuruldu!', author: 'techguru', subreddit: 'teknoloji', votes: 2847, comments: 324 },
        { id: 2, title: 'React 19 çıktı!', author: 'coderlife', subreddit: 'programlama', votes: 1523, comments: 187 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Posts Management</h1>
        <p className="text-gray-400">Monitor and manage all posts on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Posts</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="flagged">Flagged</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>👤 {post.author}</span>
                  <span>🏘️ c/{post.community}</span>
                  <span>⏰ {post.created}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                post.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {post.status}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
              <div>
                <p className="text-gray-400 text-xs mb-1">Votes</p>
                <p className="text-lg font-bold text-orange-400">{post.votes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Comments</p>
                <p className="text-lg font-bold text-blue-400">{post.comments}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Engagement</p>
                <p className="text-lg font-bold text-purple-400">{((post.votes + post.comments) / post.votes * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
              {post.status === 'flagged' && (
                <>
                  <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                    Remove
                  </button>
                </>
              )}
              <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-white">{posts.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Published</p>
          <p className="text-2xl font-bold text-green-400">{posts.filter(p => p.status === 'published').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Flagged</p>
          <p className="text-2xl font-bold text-red-400">{posts.filter(p => p.status === 'flagged').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Avg Engagement</p>
          <p className="text-2xl font-bold text-purple-400">{(posts.reduce((sum, p) => sum + p.votes + p.comments, 0) / posts.length).toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPosts;
