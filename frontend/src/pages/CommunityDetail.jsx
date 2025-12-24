import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import EngagementTracker from '../components/EngagementTracker';
import axiosInstance from '../api/axiosInstance';

function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('new');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    if (user && communityId) {
      checkMembership(user, communityId);
    }
  }, [communityId]);

  const checkMembership = async (user, cId) => {
    if (!user) {
      setIsJoined(false);
      return;
    }
    try {
      const memberResponse = await axiosInstance.get(`/communities/${cId}/check-membership`);
      setIsJoined(memberResponse.data.isMember);
    } catch (err) {
      console.log('Membership check error:', err);
      setIsJoined(false);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
    fetchCommunityPosts();
  }, [communityId]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/communities/${communityId}`);
      console.log('Community details:', response.data);
      setCommunity(response.data.community || response.data);
    } catch (err) {
      console.error('Topluluk detayları yüklenirken hata:', err);
      setError('Topluluk bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await axiosInstance.get(`/posts`, {
        params: { communityId: communityId }
      });
      console.log('Community posts:', response.data);
      const postsData = response.data.posts || response.data || [];
      setPosts(postsData);
    } catch (err) {
      console.error('Topluluk gönderileri yüklenirken hata:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setJoinLoading(true);
    setJoinError(null);
    const previousState = isJoined; // Store previous state for rollback

    try {
      // Optimistic update
      setIsJoined(!isJoined);

      if (previousState) {
        // User is leaving
        const response = await axiosInstance.post(`/auth/community/${communityId}/leave`);
        console.log('Leave community response:', response.data);
      } else {
        // User is joining
        const response = await axiosInstance.post(`/auth/community/${communityId}/join`);
        console.log('Join community response:', response.data);
      }

      // Refresh community data to update member count
      await fetchCommunityDetails();
    } catch (err) {
      console.error('Join/Leave hata:', err);
      // Rollback optimistic update on error
      setIsJoined(previousState);
      const errorMessage = err.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setJoinError(errorMessage);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setJoinError(null);
      }, 3000);
    } finally {
      setJoinLoading(false);
    }
  };

  const getFilteredPosts = () => {
    let filtered = [...posts];
    if (selectedFilter === 'hot') {
      return filtered.sort((a, b) => b.votes - a.votes);
    } else if (selectedFilter === 'new') {
      return filtered;
    } else if (selectedFilter === 'top') {
      return filtered.sort((a, b) => (b.votes + b.comments) - (a.votes + a.comments));
    }
    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  const formatMembers = (num) => {
    if (num === undefined || num === null) return '0';
    const count = Array.isArray(num) ? num.length : num;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'K';
    }
    return count.toString();
  };

  // Generate gradient based on community name
  const gradients = [
    'from-orange-500 to-pink-600',
    'from-blue-500 to-purple-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-orange-600',
    'from-indigo-500 to-blue-600',
  ];
  
  const hash = community?.name?.charCodeAt(0) || 0;
  const gradient = gradients[hash % gradients.length];
  const iconEmoji = ['🚀', '💬', '🎮', '📚', '🎵', '⚽', '🍕'][hash % 7];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-20">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300 mb-4">{error || 'Topluluk bulunamadı'}</p>
            <button
              onClick={() => navigate('/communities')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
            >
              Topluluklar'a Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <EngagementTracker communityId={communityId} />
      
      <div className="max-w-7xl mx-auto px-4 pt-5">
        {/* Community Header Banner */}
        <div className={`bg-gradient-to-r ${gradient} rounded-t-3xl h-48 mb-0 opacity-90`}></div>

        {/* Community Info Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-b-3xl border-t-0 p-6 mb-8 shadow-xl">
          <div className="flex items-start justify-between">
            {/* Left Section */}
            <div className="flex items-start space-x-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl shadow-lg -mt-16 border-4 border-gray-800`}>
                {iconEmoji}
              </div>
              
              <div className="flex-1 mt-2">
                <h1 className="text-4xl font-bold text-gray-100 mb-2">{community.name}</h1>
                <p className="text-gray-400 text-lg mb-4 max-w-2xl">
                  {community.description || 'Topluluk hakkında bilgi yok'}
                </p>
                
                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-400">{formatMembers(community.members)}</span>
                    <span className="text-gray-400">Üye</span>
                  </div>
                  <div className="w-px h-6 bg-gray-600"></div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-pink-400">{posts.length}</span>
                    <span className="text-gray-400">Gönderi</span>
                  </div>
                  {community.owner_id && (
                    <>
                      <div className="w-px h-6 bg-gray-600"></div>
                      <span className="text-gray-400">Özel: {community.is_private ? 'Evet' : 'Hayır'}</span>
                    </>
                  )}
                </div>

                {/* Rules */}
                {community.rules && community.rules.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Topluluk Kuralları:</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {community.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Join Button */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleJoinToggle}
                disabled={joinLoading}
                className={`px-8 py-3 rounded-xl font-semibold transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                  isJoined
                    ? 'bg-gray-700 hover:bg-red-600/50 hover:border-red-600 text-gray-200 border border-gray-600'
                    : 'bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-lg hover:shadow-orange-500/30 text-white'
                }`}
              >
                {joinLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin">⟳</span>
                    {isJoined ? 'Ayrılıyor...' : 'Katılıyor...'}
                  </span>
                ) : (
                  isJoined ? '✓ Ayrıl' : 'Katıl'
                )}
              </button>
              {joinError && (
                <div className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/30">
                  {joinError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Posts Feed */}
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

            {/* Posts Loading */}
            {postsLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            )}

            {/* Posts List */}
            {!postsLoading && filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              !postsLoading && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400 text-lg mb-4">Bu toplulukta henüz gönderi yok</p>
                  {isJoined && currentUser && (
                    <button
                      onClick={() => navigate('/create-post')}
                      className="bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-lg hover:shadow-orange-500/30 text-white px-6 py-2 rounded-lg transition"
                    >
                      İlk Gönderiyi Oluştur
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Sidebar - Community Stats */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 shadow-xl sticky top-20 space-y-5">
              {/* About Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-100 mb-3">Topluluk Bilgileri</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Üyeler</span>
                    <span className="font-semibold text-orange-400">{formatMembers(community.members)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Gönderiler</span>
                    <span className="font-semibold text-pink-400">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                    <span className="text-gray-400">Kuralı</span>
                    <span className="font-semibold text-gray-300">{community.rules?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Özellik</span>
                    <span className="font-semibold text-gray-300">{community.is_private ? 'Özel' : 'Açık'}</span>
                  </div>
                </div>
              </div>

              {/* Create Post Button */}
              {isJoined && currentUser && (
                <button
                  onClick={() => navigate('/create-post')}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-lg hover:shadow-orange-500/30 text-white py-2 rounded-lg font-semibold transition"
                >
                  Gönderi Oluştur
                </button>
              )}

             
             

              {/* Back Button */}
              <button
                onClick={() => navigate('/communities')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg font-semibold transition"
              >
                Topluluklar'a Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityDetail;
