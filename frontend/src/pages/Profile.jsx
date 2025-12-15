import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchUserAndPosts = async () => {
    try {
      setLoading(true);
      
      // localStorage'dan giriş yapan kullanıcıyı al
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      
      if (!currentUser || !currentUser.id) {
        setError('Lütfen giriş yapınız');
        setLoading(false);
        return;
      }
      
      // Kullanıcı bilgisi fetch et (gerçek kullanıcı ID'si ile)
      const userResponse = await axiosInstance.get(`/users/${currentUser.id}`);
            const userData = userResponse.data;

      // Kullanıcının postlarını fetch et
      const postsResponse = await axiosInstance.get(`/posts`);
      const posts = postsResponse.data.posts || postsResponse.data;
      const userPosts = posts
        .filter(post => post.userId === currentUser.id || post.author === userData.username)
        .map(post => ({
          id: post._id,
          subreddit: post.subreddit,
          author: post.author,
          title: post.title,
          content: post.content,
          votes: post.votes,
          comments: post.comments,
          timeAgo: new Date(post.createdAt).toLocaleDateString('tr-TR'),
        }));

      // Kullanıcı bilgisini ve postları state'e kaydet
      setUser({
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
          followers: 0,
        },
        posts: userPosts,
      });
      
      setError(null);
    } catch (err) {
      console.error('Kullanıcı verileri yüklenirken hata:', err);
      setError('Kullanıcı verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
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

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-400">{error}</p>
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
            <ProfileHeader user={user} />
            <ProfileStats user={user} />
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
