import { useState, useEffect } from 'react';
import * as userApi from '../api/userApi';

function ProfileHeader({ user, isOwnProfile = false, onEditClick, currentUserId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOwnProfile && user?.id && currentUserId) {
      checkFollowStatus();
    }
  }, [user?.id, currentUserId, isOwnProfile]);

  const checkFollowStatus = async () => {
    try {
      const response = await userApi.isFollowing(currentUserId, user.id);
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error('Takip durumu kontrol edilirken hata:', error);
    }
  };

  const handleFollowClick = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await userApi.unfollowUser(user.id);
      } else {
        await userApi.followUser(user.id);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Takip işlemi başarısız oldu:', error);
      alert(error.response?.data?.error || 'İşlem başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-orange-500/20 to-pink-600/20 rounded-2xl relative border border-orange-500/20"></div>

      {/* Profile Info */}
      <div className="flex items-end gap-4 px-6 pb-4 -mt-16 relative z-10">
        {/* Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl ring-4 ring-gray-900 shadow-2xl"></div>

        {/* User Info */}
        <div className="flex-1 mb-2">
          <h1 className="text-3xl font-bold text-gray-100">{user.name}</h1>
          <p className="text-lg text-gray-400">u/{user.username}</p>
          <p className="text-sm text-gray-500 mt-1">Üye {user.joinDate}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-2">
          {isOwnProfile ? (
            <>
              <button
                onClick={onEditClick}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg shadow-orange-500/20"
              >
                Profili Düzenle
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleFollowClick}
                disabled={loading}
                className={`px-6 py-2 rounded-xl font-bold transition-all shadow-lg ${
                  isFollowing
                    ? 'bg-gray-700 text-white hover:bg-gray-600 shadow-gray-700/20'
                    : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-orange-500/20'
                } disabled:opacity-50`}
              >
                {loading ? 'İşlem yapılıyor...' : isFollowing ? 'Takibi Bırak' : 'Takip Et'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 py-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 mt-4">
        <p className="text-gray-300 leading-relaxed">
          {user.bio}
        </p>
      </div>
    </div>
  );
}

export default ProfileHeader;
