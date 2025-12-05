import { useState, useEffect } from 'react';
import axios from 'axios';
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
      
      // Kullanıcı bilgisi fetch et
      const userResponse = await axios.get(`${API_URL}/users/1`);
      const userData = userResponse.data;

      // Kullanıcının postlarını fetch et
      const postsResponse = await axios.get(`${API_URL}/posts`);
      const userPosts = postsResponse.data
        .filter(post => post.author === userData.username)
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

      setUser({
        name: userData.username,
        username: userData.username,
        joinDate: new Date(userData.createdAt).toLocaleDateString('tr-TR'),
        bio: '🚀 BuzzHub Kullanıcısı | Topluluk Üyesi',
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
      
      // Fallback veri
      setUser({
        name: 'Ahmet Yılmaz',
        username: 'ahmet_dev',
        joinDate: '2 Ocak 2022',
        bio: '🚀 BuzzHub Uzmanı | Teknoloji Meraklısı | Open Source Tutkunu | Coffee ☕',
        location: '📍 İstanbul, Türkiye',
        website: '🌐 ahmet.dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet_dev',
        stats: {
          postCount: 234,
          karma: 12500,
          followers: 1250,
        },
        posts: [],
      });
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
