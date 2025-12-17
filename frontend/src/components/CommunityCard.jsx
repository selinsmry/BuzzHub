import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function CommunityCard({ community, isJoined: initialJoined = false, onUpdate = () => {} }) {
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoinToggle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Join/Leave clicked for community:', community._id);

      if (isJoined) {
        console.log('Leaving community...');
        const response = await axiosInstance.post(`/auth/community/${community._id}/leave`);
        console.log('Leave response:', response.data);
        setIsJoined(false);
      } else {
        console.log('Joining community...');
        const response = await axiosInstance.post(`/auth/community/${community._id}/join`);
        console.log('Join response:', response.data);
        setIsJoined(true);
      }
      onUpdate();
    } catch (err) {
      console.error('İşlem başarısız:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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

  // Generate a consistent color based on community name
  const gradients = [
    'from-orange-500 to-pink-600',
    'from-blue-500 to-purple-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-orange-600',
    'from-indigo-500 to-blue-600',
  ];
  
  const hash = community.name.charCodeAt(0);
  const gradient = gradients[hash % gradients.length];
  const iconEmoji = ['🚀', '💬', '🎮', '📚', '🎵', '⚽', '🍕'][hash % 7];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-orange-500/30 group cursor-pointer" onClick={() => navigate(`/communities/${community._id}`)}>
      {/* Banner */}
      <div className={`h-24 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition`}></div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg -mt-8 border-4 border-gray-800`}>
              {iconEmoji}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-100 group-hover:text-orange-400 transition">
                {community.name}
              </h3>
              <p className="text-xs text-gray-500 capitalize">{community.name}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {community.description || 'Topluluk hakkında bilgi yok'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-700/50">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-orange-400">{formatMembers(community.members)}</p>
            <p className="text-xs text-gray-500">Üye</p>
          </div>
          <div className="w-px h-8 bg-gray-700/50"></div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-pink-400">0</p>
            <p className="text-xs text-gray-500">Gönderi/Gün</p>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleJoinToggle();
          }}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
            isJoined
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
              : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/20'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? '...' : (isJoined ? '✓ Üyesin' : 'Katıl')}
        </button>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default CommunityCard;
