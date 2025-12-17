import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getImageUrl } from '../utils/imageHelper';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votes, setVotes] = useState(0);
  const [voteStatus, setVoteStatus] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Comment states
  const [comments, setComments] = useState([]);
  const [commentTitle, setCommentTitle] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit states
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentTitle, setEditCommentTitle] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const [submittingEditComment, setSubmittingEditComment] = useState(false);

  // User profile edit states
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [userBio, setUserBio] = useState('');
  const [submittingUserEdit, setSubmittingUserEdit] = useState(false);
  const [authorData, setAuthorData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  useEffect(() => {
    if (post) {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      setCurrentUser(user);

      // Check if current user is the owner - test both id and _id properties
      if (user && post.userId) {
        const userId = user._id || user.id;
        const postOwnerId = post.userId;
        console.log('Owner check:', { userId, postOwnerId, isEqual: String(userId) === String(postOwnerId) });
        if (String(userId) === String(postOwnerId)) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }

      // Set edit form values when post loads
      setEditPostTitle(post.title);
      setEditPostContent(post.content);

      // Load previous vote status
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const previousVote = userVotes[post._id || post.id];
      if (previousVote) {
        setVoteStatus(previousVote);
      }

      // Fetch author data
      if (post.author) {
        fetchAuthorData(post.author);
      }

      // Fetch comments
      fetchComments();
    }
  }, [post]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/posts/${id}`);
      setPost(response.data);
      setVotes(response.data.votes || 0);
    } catch (err) {
      console.error('Post yüklenirken hata:', err);
      setError('Post bulunamadı veya yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`${API_URL}/posts/${id}/comments`);
      setComments(response.data || []);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchAuthorData = async (authorUsername) => {
    try {
      // Try to fetch user by username or get from API
      const response = await axios.get(`${API_URL}/users/username/${authorUsername}`);
      setAuthorData(response.data);
      setUserBio(response.data.bio || '');
    } catch (err) {
      console.error('Yazar bilgisi yüklenirken hata:', err);
      // Set basic author data from post if fetch fails
      setAuthorData({
        username: authorUsername,
        bio: '',
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Yorum yapmak için giriş yapmanız gerekir');
      navigate('/login');
      return;
    }

    if (!commentTitle.trim() || !commentContent.trim()) {
      alert('Lütfen yorum başlığı ve içeriği girin');
      return;
    }

    // Yorumların açık olduğunu kontrol et
    if (post.commentsEnabled === false) {
      alert('Bu post\'a yorum yapılamaz, yorumlar kapalı');
      return;
    }

    try {
      setSubmittingComment(true);
      console.log('currentUser object:', currentUser);
      console.log('currentUser._id:', currentUser?._id);
      console.log('currentUser.id:', currentUser?.id);
      console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
      
      const userId = currentUser._id || currentUser.id;
      console.log('Kullanılacak userId:', userId);
      
      const payload = {
        title: commentTitle,
        content: commentContent,
        userId: userId,
        postId: post._id || post.id,
      };
      
      console.log('Gönderilen payload:', payload);
      const response = await axios.post(`${API_URL}/comments`, payload);

      // Yeni yorum listesine ekle
      setComments([response.data, ...comments]);
      
      // Formu temizle
      setCommentTitle('');
      setCommentContent('');
      
      // Post'un yorum sayısını güncelle
      setPost({ ...post, comments: (post.comments || 0) + 1 });
    } catch (err) {
      console.error('Yorum eklenirken hata:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status:', err.response?.status);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Yorum eklenirken hata oluştu';
      alert(errorMsg);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    if (!currentUser || String(currentUser._id || currentUser.id) !== String(commentUserId)) {
      alert('Sadece kendi yorumlarınızı silebilirsiniz');
      return;
    }

    if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`${API_URL}/comments/${commentId}`, {
          data: { userId: currentUser._id || currentUser.id },
        });

        // Yorum listesinden kaldır
        setComments(comments.filter(c => c._id !== commentId));
        
        // Post'un yorum sayısını güncelle
        setPost({ ...post, comments: Math.max(0, (post.comments || 1) - 1) });
      } catch (err) {
        console.error('Yorum silinirken hata:', err);
        alert(err.response?.data?.message || 'Yorum silinirken hata oluştu');
      }
    }
  };

  const handleEditPost = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      alert('Lütfen başlık ve içeriği girin');
      return;
    }

    try {
      setSubmittingPost(true);
      const response = await axios.put(`${API_URL}/posts/${post._id}`, {
        title: editPostTitle,
        content: editPostContent,
        userId: currentUser._id,
      });

      setPost(response.data);
      setShowEditPostModal(false);
      alert('Post başarıyla güncellendi');
    } catch (err) {
      console.error('Post güncellenirken hata:', err);
      alert(err.response?.data?.message || 'Post güncellenirken hata oluştu');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentTitle.trim() || !editCommentContent.trim()) {
      alert('Lütfen yorum başlığı ve içeriğini girin');
      return;
    }

    try {
      setSubmittingEditComment(true);
      const response = await axios.put(`${API_URL}/comments/${commentId}`, {
        title: editCommentTitle,
        content: editCommentContent,
        userId: currentUser._id || currentUser.id,
      });

      // Yorum listesini güncelle
      const updatedComments = comments.map(c => c._id === commentId ? response.data : c);
      setComments(updatedComments);
      
      setEditingCommentId(null);
      setEditCommentTitle('');
      setEditCommentContent('');
      alert('Yorum başarıyla güncellendi');
    } catch (err) {
      console.error('Yorum güncellenirken hata:', err);
      alert(err.response?.data?.message || 'Yorum güncellenirken hata oluştu');
    } finally {
      setSubmittingEditComment(false);
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentTitle(comment.title);
    setEditCommentContent(comment.content);
  };

  const handleVote = async (type) => {
    try {
      let newVotes = votes;
      let newStatus = voteStatus;

      // Voting logic
      if (voteStatus === type) {
        newVotes = post.votes;
        newStatus = null;
      } else if (voteStatus === null) {
        newVotes = type === 'up' ? votes + 1 : votes - 1;
        newStatus = type;
      } else {
        newVotes = type === 'up' ? votes + 2 : votes - 2;
        newStatus = type;
      }

      // Optimistic update
      setVotes(newVotes);
      setVoteStatus(newStatus);

      // Send to API
      await axios.put(`${API_URL}/votes/${post._id || post.id}`, {
        votes: newVotes,
      });

      // Save vote status to localStorage
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      if (newStatus === null) {
        delete userVotes[post._id || post.id];
      } else {
        userVotes[post._id || post.id] = newStatus;
      }
      localStorage.setItem('userVotes', JSON.stringify(userVotes));
    } catch (err) {
      console.error('Oy verilirken hata oluştu:', err);
      setVotes(votes);
      setVoteStatus(voteStatus);
      
      // 401 hatası ise (giriş yapılmamış) - axiosInstance redirect edecek
      if (err.response?.status === 401) {
        return;
      }
      
      alert('Oy verilirken hata oluştu');
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${post._id || post.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
      try {
        setIsDeleting(true);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        await axios.delete(`${API_URL}/posts/${post._id || post.id}`, {
          data: { userId: currentUser._id },
        });

        navigate('/');
      } catch (err) {
        console.error('Gönderi silinirken hata:', err);
        alert(err.response?.data?.message || 'Gönderi silinirken hata oluştu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    try {
      setSubmittingUserEdit(true);
      const token = localStorage.getItem('accessToken');
      
      await axios.put(
        `${API_URL}/users/profile`,
        { bio: userBio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.bio = userBio;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Update author data
      setAuthorData({ ...authorData, bio: userBio });
      setShowUserEditModal(false);
      alert('Profil başarıyla güncellendi!');
    } catch (err) {
      console.error('Profil güncellenirken hata:', err);
      alert('Profil güncellenirken hata oluştu');
    } finally {
      setSubmittingUserEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-300 text-lg">{error || 'Post bulunamadı'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-orange-400 transition mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Geri Dön</span>
        </button>

        {/* Main Post Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="flex">
            {/* Vote Section */}
            <div className="flex flex-col items-center bg-gray-900/50 px-4 py-6 rounded-l-2xl min-w-fit">
              <button
                onClick={() => handleVote('up')}
                className={`p-2 hover:bg-gray-700 rounded-lg transition mb-2 ${
                  voteStatus === 'up' ? 'text-orange-500' : 'text-gray-500'
                }`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3l7 7H3l7-7z" />
                </svg>
              </button>
              <span
                className={`text-lg font-bold mb-2 ${
                  voteStatus === 'up'
                    ? 'text-orange-500'
                    : voteStatus === 'down'
                    ? 'text-blue-400'
                    : 'text-gray-300'
                }`}
              >
                {votes >= 1000 ? `${(votes / 1000).toFixed(1)}k` : votes}
              </span>
              <button
                onClick={() => handleVote('down')}
                className={`p-2 hover:bg-gray-700 rounded-lg transition ${
                  voteStatus === 'down' ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 17l-7-7h14l-7 7z" />
                </svg>
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center text-sm text-gray-500 mb-3 gap-1 overflow-hidden">
                    <span className="font-bold text-orange-400 hover:text-orange-300 cursor-pointer transition truncate">
                      r/{post.subreddit}
                    </span>
                    <span className="flex-shrink-0">•</span>
                    <span className="flex-shrink-0">Gönderen</span>
                    <span className="ml-1 text-gray-400 hover:text-gray-300 cursor-pointer transition truncate">
                      u/{post.author || post.userId?.username || 'Bilinmiyor'}
                    </span>
                  </div>
                  {/* Title */}
                  <h1 className="text-3xl font-bold text-gray-100 break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>{post.title}</h1>
                </div>

                {/* Edit/Delete Buttons for Post Owner */}
                {isOwner && (
                  <div className="flex items-center space-x-2 flex-shrink-0 mt-1">
                    <button
                      onClick={() => setShowEditPostModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium text-sm whitespace-nowrap"
                      title="Gönderiyi Düzenle"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition font-medium text-sm disabled:cursor-not-allowed whitespace-nowrap"
                      title="Gönderiyi Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>{isDeleting ? 'Siliniyor...' : 'Sil'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Image if exists */}
              {post.image && (
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-4 shadow-lg"
                  onError={(e) => {
                    console.error('Resim yüklenemedi:', post.image);
                    e.target.style.display = 'none';
                  }}
                />
              )}

              {/* Content */}
              <p className="text-gray-300 text-lg leading-relaxed mb-6 whitespace-pre-wrap break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>
                {post.content}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-400 border-t border-gray-700/50 pt-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <span>{post.comments || 0} Yorum {post.commentsEnabled === false && '(Kapalı)'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-gray-700/50">
                {post.commentsEnabled !== false && (
                  <button 
                    onClick={() => document.querySelector('.comment-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 rounded-lg transition text-gray-400 hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Yorum Yap</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Author Profile Card */}
        

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Yorumlar</h2>

          {/* Add Comment Form */}
          {post.commentsEnabled === false ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 mb-6 text-center">
              <p className="text-gray-300">Bu post'a yorum yapılamaz, yorumlar kapalı</p>
            </div>
          ) : currentUser ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 comment-form">
              <form onSubmit={handleAddComment}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={commentTitle}
                    onChange={(e) => setCommentTitle(e.target.value)}
                    placeholder="Yorum başlığı"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Yorumunu buraya yaz..."
                    rows="4"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg transition disabled:cursor-not-allowed"
                >
                  {submittingComment ? 'Gönderiliyor...' : 'Yorum Gönder'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 text-center">
              <p className="text-gray-400 mb-4">Yorum yapmak için giriş yapmanız gerekir</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
              >
                Giriş Yap
              </button>
            </div>
          )}

          {/* Comments List */}
          {post.commentsEnabled === false ? null : loadingComments ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/50 transition">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100">{comment.title}</h3>
                      <p className="text-sm text-gray-500">
                        <span className="text-orange-400 hover:text-orange-300 cursor-pointer transition">
                          u/{comment.userId?.username || 'Anonim'}
                        </span>
                        {' '} • {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {currentUser && comment.userId && String(currentUser._id || currentUser.id) === String(comment.userId._id || comment.userId) && (
                        <>
                          <button
                            onClick={() => startEditComment(comment)}
                            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700/50 rounded-lg transition"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id, comment.userId._id || comment.userId)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition"
                            title="Sil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-3">
                      <div className="mb-3">
                        <input
                          type="text"
                          value={editCommentTitle}
                          onChange={(e) => setEditCommentTitle(e.target.value)}
                          placeholder="Yorum başlığı"
                          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                        />
                      </div>
                      <div className="mb-3">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          placeholder="Yorum içeriği"
                          rows="3"
                          className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          disabled={submittingEditComment}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg transition disabled:cursor-not-allowed text-sm"
                        >
                          {submittingEditComment ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition text-sm"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 whitespace-pre-wrap mb-3">{comment.content}</p>
                      {comment.image && (
                        <img 
                          src={getImageUrl(comment.image)}
                          alt="Yorum resmi" 
                          className="max-h-96 w-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          onError={(e) => {
                            console.error('Yorum resmi yüklenemedi:', comment.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="text-center text-gray-400 py-12">
                <p>Henüz yorum yok. İlk yorumu sen yap!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Post Modal */}
      {showEditPostModal && isOwner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditPostModal(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100">Gönderiyi Düzenle</h2>
              <button 
                onClick={() => setShowEditPostModal(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleEditPost(); }}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Başlık</label>
                  <input
                    type="text"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    placeholder="Gönderinin başlığını gir"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-semibold mb-2">İçerik</label>
                  <textarea
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    placeholder="Gönderinin içeriğini gir"
                    rows="8"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                  />
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditPostModal(false)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg transition disabled:cursor-not-allowed"
                  >
                    {submittingPost ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Edit Modal */}
      {showUserEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUserEditModal(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100">Profil Düzenle</h2>
              <button
                onClick={() => setShowUserEditModal(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUpdateUserProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={post.author}
                  disabled
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Kullanıcı adı değiştirilemez</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Biyografi (Bio)
                </label>
                <textarea
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  maxLength={150}
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{userBio.length} / 150</p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowUserEditModal(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submittingUserEdit}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg transition disabled:cursor-not-allowed"
                >
                  {submittingUserEdit ? 'Kaydediliyor...' : 'Profili Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetail;
