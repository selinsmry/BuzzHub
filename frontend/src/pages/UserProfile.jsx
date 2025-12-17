import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import * as userApi from '../api/userApi';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUserId(currentUser.id);
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı bilgisi fetch et
      const userResponse = await axiosInstance.get(`/auth/users/${userId}`);
      const userData = userResponse.data;

      // Followers ve Following bilgilerini al
      const followersResponse = await axiosInstance.get(`/auth/followers/${userId}`);
      const followingResponse = await axiosInstance.get(`/auth/following/${userId}`);
      
      const followers = followersResponse.data.followers || [];
      const following = followingResponse.data.following || [];

      // Kullanıcının postlarını fetch et
      const postsResponse = await axiosInstance.get(`/posts?userId=${userId}`);
      const posts = postsResponse.data.posts || postsResponse.data;
      const userPosts = posts
        .map(post => {
          const postUserId = typeof post.userId === 'object' ? post.userId._id : post.userId;
          return {
            _id: post._id,
            id: post._id,
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
            content: post.content,
            votes: post.votes,
            comments: post.comments,
            userId: postUserId,
            timeAgo: new Date(post.createdAt).toLocaleDateString('tr-TR'),
          };
        });

      // Kullanıcının yorumlarını fetch et
      const commentsResponse = await axiosInstance.get(`/comments?userId=${userId}`);
      const userComments = (commentsResponse.data || [])
        .map(comment => ({
          _id: comment._id,
          id: comment._id,
          title: comment.title,
          content: comment.content,
          postId: comment.postId,
          votes: comment.votes || 0,
          createdAt: comment.createdAt,
          timeAgo: new Date(comment.createdAt).toLocaleDateString('tr-TR'),
        }));

      setUser({
        id: userData._id,
        name: userData.username,
        username: userData.username,
        joinDate: new Date(userData.createdAt).toLocaleDateString('tr-TR'),
        bio: userData.bio || '👤 BuzzHub Kullanıcısı',
        location: '📍 Türkiye',
        website: '🌐 toplulukapp.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        stats: {
          postCount: userPosts.length,
          karma: userPosts.reduce((sum, p) => sum + p.votes, 0),
          followers: followers.length,
          following: following.length,
          commentCount: userComments.length,
        },
        posts: userPosts,
        comments: userComments,
      });
      
      setError(null);
    } catch (err) {
      console.error('Kullanıcı profili yüklenirken hata:', err);
      setError('Kullanıcı profili yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = async (isNowFollowing) => {
    // Takip durumu değiştiğinde takipçi sayısını güncelle
    setUser(prevUser => ({
      ...prevUser,
      stats: {
        ...prevUser.stats,
        followers: isNowFollowing ? prevUser.stats.followers + 1 : Math.max(0, prevUser.stats.followers - 1)
      }
    }));
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-400">{error || 'Kullanıcı bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20">
        {user && (
          <>
            <ProfileHeader 
              user={user} 
              isOwnProfile={false}
              currentUserId={currentUserId}
              onFollowChange={handleFollowChange}
            />
            <ProfileStats user={user} />
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
