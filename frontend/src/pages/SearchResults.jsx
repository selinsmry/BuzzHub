import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CommunityCard from '../components/CommunityCard';
import PostCard from '../components/PostCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      // Search communities
      try {
        const commResponse = await axios.get(`${API_URL}/communities`);
        const commData = commResponse.data.communities || commResponse.data || [];
        const filtered = commData.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
        );
        setCommunities(filtered);
      } catch (err) {
        console.error('Topluluk arama hatası:', err);
        setCommunities([]);
      }

      // Search posts
      try {
        const postResponse = await axios.get(`${API_URL}/posts`);
        const postData = postResponse.data.posts || postResponse.data || [];
        const filtered = postData.filter(p =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.content.toLowerCase().includes(query.toLowerCase())
        );
        setPosts(filtered);
      } catch (err) {
        console.error('Post arama hatası:', err);
        setPosts([]);
      }

      // Search users
      try {
        const userResponse = await axios.get(`${API_URL}/users`);
        const userData = userResponse.data.users || userResponse.data || [];
        const filtered = userData.filter(u =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
        );
        setUsers(filtered);
      } catch (err) {
        console.error('Kullanıcı arama hatası:', err);
        setUsers([]);
      }
    } catch (err) {
      console.error('Arama hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const allResults = [...communities, ...posts, ...users];

  const getContent = () => {
    if (loading) {
      return <div className="text-center py-12 text-gray-400">Aranıyor...</div>;
    }

    if (!query.trim()) {
      return <div className="text-center py-12 text-gray-400">Arama terimi girin</div>;
    }

    if (allResults.length === 0) {
      return <div className="text-center py-12 text-gray-400">Sonuç bulunamadı</div>;
    }

    if (selectedTab === 'all') {
      return (
        <div className="space-y-4">
          {communities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Topluluklar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {communities.map(community => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3 mt-6">Gönderiler</h3>
              <div className="space-y-3">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-3 mt-6">Kullanıcılar</h3>
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition cursor-pointer"
                  >
                    <p className="font-semibold text-gray-100">{user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } else if (selectedTab === 'communities') {
      if (communities.length === 0) {
        return <div className="text-center py-12 text-gray-400">Topluluk bulunamadı</div>;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map(community => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      );
    } else if (selectedTab === 'posts') {
      if (posts.length === 0) {
        return <div className="text-center py-12 text-gray-400">Gönderi bulunamadı</div>;
      }
      return (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      );
    } else if (selectedTab === 'users') {
      if (users.length === 0) {
        return <div className="text-center py-12 text-gray-400">Kullanıcı bulunamadı</div>;
      }
      return (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user._id}
              onClick={() => navigate(`/user/${user._id}`)}
              className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition cursor-pointer"
            >
              <p className="font-semibold text-gray-100">{user.username}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-5 flex gap-6">
        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">
              Arama Sonuçları
            </h1>
            <p className="text-gray-400">
              "{query}" için sonuçlar
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl mb-6 p-2 flex items-center space-x-2 shadow-xl">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                selectedTab === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedTab('communities')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                selectedTab === 'communities'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              Topluluklar
            </button>
            <button
              onClick={() => setSelectedTab('posts')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                selectedTab === 'posts'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              Gönderiler
            </button>
            <button
              onClick={() => setSelectedTab('users')}
              className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                selectedTab === 'users'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/20'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              Kullanıcılar
            </button>
          </div>

          {/* Results */}
          {getContent()}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}

export default SearchResults;
