import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileStats from '../components/ProfileStats';
import EditProfileModal from '../components/EditProfileModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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

      // Kendi profili mi kontrol et
      setIsOwnProfile(true);
      
      // Kullanıcı bilgisi fetch et (gerçek kullanıcı ID'si ile)
      const userResponse = await axiosInstance.get(`/auth/users/${currentUser.id}`);
      const userData = userResponse.data;

      // Followers ve Following bilgilerini al
      const followersResponse = await axiosInstance.get(`/auth/followers/${currentUser.id}`);
      const followingResponse = await axiosInstance.get(`/auth/following/${currentUser.id}`);
      
      const followers = followersResponse.data.followers || [];
      const following = followingResponse.data.following || [];

      // Kullanıcının postlarını fetch et (userId parametresi ile)
      const postsResponse = await axiosInstance.get(`/posts?userId=${currentUser.id}`);
      const posts = postsResponse.data.posts || postsResponse.data;
      const userPosts = posts
        .map(post => {
          // userId populate edilmiş bir nesne olabilir
          const userId = typeof post.userId === 'object' ? post.userId._id : post.userId;
          return {
            _id: post._id,
            id: post._id,
            subreddit: post.subreddit,
            author: post.author,
            title: post.title,
            content: post.content,
            votes: post.votes,
            comments: post.comments,
            userId: userId,
            timeAgo: new Date(post.createdAt).toLocaleDateString('tr-TR'),
          };
        });

      // Kullanıcının yorumlarını fetch et
      const commentsResponse = await axiosInstance.get(`/comments?userId=${currentUser.id}`);
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

      // Kullanıcı bilgisini, postları ve yorumları state'e kaydet
      setUser({
        id: userData._id,
        name: userData.username,
        username: userData.username,
        joinDate: new Date(userData.createdAt).toLocaleDateString('tr-TR'),
        bio: userData.bio || 'Biyografi giriniz.',
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
      console.error('Kullanıcı verileri yüklenirken hata:', err);
      setError('Kullanıcı verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updatedUser) => {
    setUser(prev => ({
      ...prev,
      username: updatedUser.username || prev.username,
      name: updatedUser.username || prev.name,
      bio: updatedUser.bio || prev.bio,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-20">
        {user && (
          <>
            <ProfileHeader 
              user={user} 
              isOwnProfile={isOwnProfile}
              onEditClick={() => setIsEditModalOpen(true)}
            />
            <ProfileStats user={user} />
          </>
        )}
      </div>
      
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default Profile;
