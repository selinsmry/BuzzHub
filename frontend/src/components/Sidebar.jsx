import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCommunities } from '../api/communityApi';
import axiosInstance from '../api/axiosInstance';

function Sidebar() {
  const navigate = useNavigate();
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCommunities, setUserCommunities] = useState([]);
  const [joiningCommunity, setJoiningCommunity] = useState(null);

  const icons = ['💻', '⚡', '🎮', '🎵', '⚽', '🎨', '📚', '🏋️', '🍕', '✈️'];

  useEffect(() => {
    loadPopularCommunities();
    fetchUserCommunities();
  }, []);

  const formatMemberCount = (count) => {
    if (!count || count === 0) return 'Üye yok';
    if (count > 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count > 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const fetchUserCommunities = async () => {
    try {
      const response = await axiosInstance.get('/auth/user-communities');
      const ids = response.data.communities?.map(c => c._id) || [];
      setUserCommunities(ids);
    } catch (err) {
      console.error('Kullanıcı toplulukları yüklenirken hata:', err);
    }
  };

  const loadPopularCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tüm toplulukları al (member_count'a göre sıralı)
      const response = await getAllCommunities(1, 100);
      
      if (!response || !response.communities) {
        throw new Error('Topluluklar yüklenemedi');
      }

      // Member count'a göre sıralayıp ilk 5'i al
      const sorted = response.communities
        .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
        .slice(0, 5)
        .map((community, index) => ({
          _id: community._id,
          name: community.name,
          description: community.description,
          member_count: community.member_count || 0,
          members: formatMemberCount(community.member_count),
          icon: icons[index % icons.length],
          owner_id: community.owner_id
        }));

      setPopularCommunities(sorted);
    } catch (err) {
      console.error('Popüler topluluklar yüklenirken hata:', err);
      setError('Topluluklar yüklenemedi');
      setPopularCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinToggle = async (e, communityId) => {
    e.stopPropagation();
    
    try {
      setJoiningCommunity(communityId);
      
      const isJoined = userCommunities.includes(communityId);
      
      if (isJoined) {
        await axiosInstance.post(`/auth/community/${communityId}/leave`);
        setUserCommunities(userCommunities.filter(id => id !== communityId));
      } else {
        await axiosInstance.post(`/auth/community/${communityId}/join`);
        setUserCommunities([...userCommunities, communityId]);
      }
    } catch (err) {
      console.error('İşlem başarısız:', err);
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleCommunityClick = (communityId) => {
    if (communityId) {
      navigate(`/communities/${communityId}`);
    }
  };

  const handleRefresh = () => {
    loadPopularCommunities();
  };

  return (
    <div className="space-y-4">
      {/* Popular Communities */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-orange-500/10 to-pink-500/10 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-200">Popüler Topluluklar</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-orange-400 transition disabled:opacity-50"
            title="Yenile"
          >
            ↻
          </button>
        </div>
        
        <div className="divide-y divide-gray-700/30">
          {loading ? (
            <div className="p-6 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <p className="text-xs mt-2">Topluluklar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-xs text-red-400">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 text-xs bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition"
              >
                Tekrar Dene
              </button>
            </div>
          ) : popularCommunities.length > 0 ? (
            popularCommunities.map((community, index) => {
              const isJoined = userCommunities.includes(community._id);
              const isLoading = joiningCommunity === community._id;
              
              return (
                <div
                  key={community._id}
                  className="flex items-center justify-between p-3.5 hover:bg-gray-700/30 transition group cursor-pointer"
                  onClick={() => handleCommunityClick(community._id)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-sm font-bold text-gray-500 w-5 flex-shrink-0">{index + 1}</span>
                    <span className="text-xl flex-shrink-0">{community.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-200 group-hover:text-orange-400 transition truncate">
                        r/{community.name}
                      </p>
                      <p className="text-xs text-gray-500">{community.members}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleJoinToggle(e, community._id)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 ml-2 flex-shrink-0 text-xs font-bold rounded-lg transition-all ${
                      isJoined
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                        : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/20'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? '...' : (isJoined ? '✓ Üyesin' : 'Katıl')}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p className="text-xs">Topluluk bulunamadı</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigate('/communities')}
          className="w-full p-3 text-sm text-orange-400 hover:bg-gray-700/30 font-semibold transition border-t border-gray-700/30"
        >
          Tümünü Gör
        </button>
      </div>

      {/* Footer */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <a href="#" className="hover:text-orange-400 hover:underline transition">Kullanıcı Sözleşmesi</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">Gizlilik Politikası</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">İçerik Politikası</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">Moderatör Kuralları</a>
        </div>
        <p className="text-xs text-gray-600 mt-3">BuzzHub, Inc. © 2025</p>
      </div>
    </div>
  );
}

export default Sidebar;
