import { useState } from 'react';

function CommunityCard({ community }) {
  const [isJoined, setIsJoined] = useState(community.isJoined);

  const handleJoinToggle = () => {
    setIsJoined(!isJoined);
  };

  const formatMembers = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:border-orange-500/30 group">
      {/* Banner */}
      <div className={`h-24 bg-gradient-to-r ${community.banner} opacity-80 group-hover:opacity-100 transition`}></div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${community.banner} flex items-center justify-center text-2xl shadow-lg -mt-8 border-4 border-gray-800`}>
              {community.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-100 group-hover:text-orange-400 transition">
                r/{community.name}
              </h3>
              <p className="text-xs text-gray-500">{community.displayName}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-700/50">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-orange-400">{formatMembers(community.members)}</p>
            <p className="text-xs text-gray-500">Üye</p>
          </div>
          <div className="w-px h-8 bg-gray-700/50"></div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-pink-400">{community.postsPerDay}</p>
            <p className="text-xs text-gray-500">Gönderi/Gün</p>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinToggle}
          className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
            isJoined
              ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
              : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/20'
          }`}
        >
          {isJoined ? '✓ Üyesin' : 'Katıl'}
        </button>
      </div>
    </div>
  );
}

export default CommunityCard;
