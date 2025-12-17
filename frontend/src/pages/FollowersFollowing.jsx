import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

function FollowersFollowing() {
  const { userId, tab } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(tab || 'followers');
  const [followingMap, setFollowingMap] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    
    if (tab) {
      setCurrentTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId, currentTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = currentTab === 'followers' 
        ? `/auth/followers/${userId}` 
        : `/auth/following/${userId}`;

      const response = await axiosInstance.get(endpoint);
      const fetchedUsers = currentTab === 'followers' 
        ? response.data.followers || [] 
        : response.data.following || [];

      setUsers(fetchedUsers);

      // Mevcut kullanıcı için takip durumunu kontrol et
      if (currentUser && currentUser.id) {
        const statusMap = {};
        for (const user of fetchedUsers) {
          try {
            const statusResponse = await axiosInstance.get(`/auth/is-following/${currentUser.id}/${user._id}`);
            statusMap[user._id] = statusResponse.data.isFollowing;
          } catch (err) {
            statusMap[user._id] = false;
          }
        }
        setFollowingMap(statusMap);
      }
    } catch (err) {
      console.error('Kullanıcılar yüklenirken hata:', err);
      setError('Kullanıcılar yüklenemedi');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!currentUser || !currentUser.id) {
      alert('Lütfen giriş yapınız');
      return;
    }

    try {
      if (followingMap[targetUserId]) {
        await axiosInstance.post('/auth/unfollow', { userIdToUnfollow: targetUserId });
      } else {
        await axiosInstance.post('/auth/follow', { userIdToFollow: targetUserId });
      }

      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId]
      }));
    } catch (err) {
      console.error('Takip işlemi başarısız:', err);
      alert('İşlem başarısız oldu');
    }
  };

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            {currentTab === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setCurrentTab('followers');
              navigate(`/profile/${userId}/followers`);
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              currentTab === 'followers'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Takipçiler
          </button>
          <button
            onClick={() => {
              setCurrentTab('following');
              navigate(`/profile/${userId}/following`);
            }}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              currentTab === 'following'
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Takip Edilenler
          </button>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0M9 7h1m4 0h1M9 15h1m4 0h1" />
              </svg>
              <p className="text-gray-400">
                {currentTab === 'followers' ? 'Henüz takipçi yok' : 'Henüz kimse takip edilmiyor'}
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 flex items-center justify-between hover:border-orange-400/50 transition"
              >
                <Link
                  to={`/user-profile/${user._id}`}
                  className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-80 transition"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold">{getInitials(user.username)}</span>
                  </div>

                  {/* User Info */}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-100 truncate">{user.username}</h3>
                    <p className="text-sm text-gray-400 truncate">{user.bio || 'Biyografi yok'}</p>
                  </div>
                </Link>

                {/* Follow Button */}
                {currentUser && currentUser.id !== user._id && (
                  <button
                    onClick={() => handleFollow(user._id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ml-4 ${
                      followingMap[user._id]
                        ? 'bg-gray-700 text-white hover:bg-gray-600 shadow-lg shadow-gray-700/20'
                        : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-lg shadow-orange-500/20'
                    }`}
                  >
                    {followingMap[user._id] ? 'Takibi Bırak' : 'Takip Et'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowersFollowing;
