import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/posts');
      const postsData = (response.data.posts || response.data || []).map(post => ({
        ...post,
        status: post.status || 'published',
      }));
      setPosts(postsData);
    } catch (err) {
      console.error('[ADMIN POSTS] Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await axiosInstance.delete(`/posts/${postId}`, {
        data: { userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser'))._id : null }
      });
      setPosts(posts.filter(p => p._id !== postId));
      alert('Gönderi başarıyla silindi');
    } catch (err) {
      console.error('[ADMIN POSTS] Error deleting post:', err);
      alert('Gönderi silinirken hata oluştu');
    }
  };

  const handleFlagPost = async (postId) => {
    try {
      await axiosInstance.put(`/posts/${postId}`, {
        status: 'flagged'
      });
      setPosts(posts.map(p => p._id === postId ? { ...p, status: 'flagged' } : p));
      alert('✅ Gönderi işaretlendi');
    } catch (err) {
      console.error('[ADMIN POSTS] Error flagging post:', err);
      alert('❌ İşlem sırasında hata oluştu');
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      await axiosInstance.put(`/posts/${postId}`, {
        status: 'published'
      });
      setPosts(posts.map(p => p._id === postId ? { ...p, status: 'published' } : p));
      alert('✅ Gönderi yayınlandı');
    } catch (err) {
      console.error('[ADMIN POSTS] Error publishing post:', err);
      alert('❌ İşlem sırasında hata oluştu');
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
        {filteredPosts.length > 0 ? filteredPosts.map((post) => (
          <div key={post._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>👤 {post.author || 'Unknown'}</span>
                  <span>🏘️ c/{post.subreddit || 'general'}</span>
                  <span>⏰ {new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
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
                <p className="text-lg font-bold text-orange-400">{(post.votes || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Comments</p>
                <p className="text-lg font-bold text-blue-400">{post.comments || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Engagement</p>
                <p className="text-lg font-bold text-purple-400">{((post.votes + post.comments) / (post.votes || 1) * 100).toFixed(0)}%</p>
              </div>
            </div>

            {/* Content preview */}
            {post.content && (
              <div className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/20">
                <p className="text-gray-300 text-sm line-clamp-2">{post.content}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedPost(post)}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
              {post.status !== 'flagged' && (
                <button
                  onClick={() => handleFlagPost(post._id)}
                  className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors text-sm font-medium">
                  Flag
                </button>
              )}
              {post.status !== 'published' && (
                <button
                  onClick={() => handlePublishPost(post._id)}
                  className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                  Publish
                </button>
              )}
              <button
                onClick={() => handleDeletePost(post._id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No posts found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl p-4">
          <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Post Details</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Title</p>
                <p className="text-white text-lg font-semibold">{selectedPost.title}</p>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Author</p>
                  <p className="text-white">{selectedPost.author || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Community</p>
                  <p className="text-white">c/{selectedPost.subreddit || 'general'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Posted On</p>
                  <p className="text-white">{new Date(selectedPost.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPost.status === 'published' ? 'bg-green-500/20 text-green-400' :
                    selectedPost.status === 'flagged' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Content</p>
                <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content || 'No content'}</p>
                </div>
              </div>

              {/* Image */}
              {selectedPost.image && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Image</p>
                  <img 
                    src={selectedPost.image} 
                    alt="Post image" 
                    className="w-full h-auto rounded-lg border border-gray-700/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Votes</p>
                  <p className="text-2xl font-bold text-orange-400">{selectedPost.votes || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Comments</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedPost.comments || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-purple-400">{((selectedPost.votes + selectedPost.comments) / (selectedPost.votes || 1) * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                {selectedPost.status !== 'flagged' && (
                  <button
                    onClick={() => {
                      handleFlagPost(selectedPost._id);
                      setSelectedPost(null);
                    }}
                    className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    Flag
                  </button>
                )}
                {selectedPost.status !== 'published' && (
                  <button
                    onClick={() => {
                      handlePublishPost(selectedPost._id);
                      setSelectedPost(null);
                    }}
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeletePost(selectedPost._id);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <p className="text-2xl font-bold text-purple-400">{posts.length > 0 ? (posts.reduce((sum, p) => sum + p.votes + p.comments, 0) / posts.length).toFixed(0) : 0}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPosts;
