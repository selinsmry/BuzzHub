import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import ToastNotification from './components/ToastNotification';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import CreatePost from './pages/CreatePost';
import CreateCommunity from './pages/CreateCommunity';
import UpdatePost from './pages/UpdatePost';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import FollowersFollowing from './pages/FollowersFollowing';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AppHome() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('hot');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/posts`);
      const postsData = response.data.posts || response.data || [];
      
      // Process posts to add computed fields
      const processedPosts = postsData.map(post => ({
        ...post,
        id: post._id, // Ensure both id and _id are available
        timeAgo: new Date(post.createdAt).toLocaleDateString('tr-TR'),
      }));
      
      setPosts(processedPosts);
    } catch (err) {
      console.error('Posts yüklenirken hata:', err);
      setError('Gönderiler yüklenemedi. Backend sunucu çalışıyor mu kontrol edin.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  const getFilteredPosts = () => {
    if (selectedFilter === 'hot') {
      return [...posts].sort((a, b) => b.votes - a.votes);
    } else if (selectedFilter === 'new') {
      return posts;
    } else if (selectedFilter === 'top') {
      return [...posts].sort((a, b) => (b.votes + b.comments) - (a.votes + a.comments));
    }
    return posts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-5 flex gap-6">
        {/* Main Feed */}
        <div className="flex-1 max-w-3xl">
          {/* Filter tabs */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl mb-5 p-2 flex items-center space-x-2 shadow-xl">
            <button
              onClick={() => setSelectedFilter('hot')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                selectedFilter === 'hot' ? 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30' : 'hover:bg-gray-700/50'
              }`}
            >
              <svg className={`w-5 h-5 ${selectedFilter === 'hot' ? 'text-white' : 'text-orange-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className={`text-sm font-semibold ${selectedFilter === 'hot' ? 'text-white' : 'text-gray-300'}`}>Popüler</span>
            </button>
            <button
              onClick={() => setSelectedFilter('new')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                selectedFilter === 'new' ? 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30' : 'hover:bg-gray-700/50'
              }`}
            >
              <svg className={`w-5 h-5 ${selectedFilter === 'new' ? 'text-white' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className={`text-sm font-semibold ${selectedFilter === 'new' ? 'text-white' : 'text-gray-300'}`}>Yeni</span>
            </button>
            <button
              onClick={() => setSelectedFilter('top')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                selectedFilter === 'top' ? 'bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/30' : 'hover:bg-gray-700/50'
              }`}
            >
              <svg className={`w-5 h-5 ${selectedFilter === 'top' ? 'text-white' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className={`text-sm font-semibold ${selectedFilter === 'top' ? 'text-white' : 'text-gray-300'}`}>En İyi</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
              {error}
            </div>
          )}

          {/* Posts */}
          {!loading && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            !loading && (
              <div className="text-center py-12 text-gray-400">
                <p>Henüz gönderi yok</p>
              </div>
            )
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

function App() {
  
  return (
    <>
      <ToastNotification />
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/create-community" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
        <Route path="/edit-post/:id" element={<ProtectedRoute><UpdatePost /></ProtectedRoute>} />
        <Route path="/update-post/:id" element={<ProtectedRoute><UpdatePost /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:userId/followers" element={<FollowersFollowing />} />
        <Route path="/profile/:userId/following" element={<FollowersFollowing />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/user-profile/:userId" element={<UserProfile />} />
        <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
        <Route path="/communities/:communityId" element={<CommunityDetail />} />
      </Routes>
    </>
  );
}

export default App;
