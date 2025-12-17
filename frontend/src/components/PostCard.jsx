import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { getImageUrl } from '../utils/imageHelper';

function PostCard({ post }) {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(post.votes);
  const [voteStatus, setVoteStatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingVoteStatus, setLoadingVoteStatus] = useState(false);
  
  // Comments modal states
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Memoize post ID to prevent infinite loops
  const postId = useMemo(() => post._id || post.id, [post._id, post.id]);

  // Fetch user vote status from backend
  const fetchUserVoteStatus = useCallback(async (userId) => {
    if (!userId) return;
    try {
      setLoadingVoteStatus(true);
      const response = await axiosInstance.get(`/votes/${postId}/user-vote`);
      setVoteStatus(response.data.voteStatus);
      setVotes(response.data.totalVotes);
    } catch (err) {
      // If error, just set to null - user might not be logged in
      setVoteStatus(null);
    } finally {
      setLoadingVoteStatus(false);
    }
  }, [postId]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    
    // Check ownership: user.id or user._id
    if (user && post.userId) {
      const userId = user._id || user.id;
      // Handle both object and string format for userId
      const postOwnerId = typeof post.userId === 'object' ? post.userId._id : post.userId;
      if (String(userId) === String(postOwnerId)) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } else {
      setIsOwner(false);
    }

    // Fetch user's vote status from backend
    if (user) {
      const userId = user._id || user.id;
      if (userId) {
        fetchUserVoteStatus(userId);
      }
    } else {
      setVoteStatus(null);
    }
  }, [postId, fetchUserVoteStatus]);

  const handleVote = async (type) => {
    if (!currentUser) {
      alert('Oy vermek için lütfen giriş yapın');
      return;
    }

    try {
      let newStatus = voteStatus;

      // Determine the vote type to send
      if (voteStatus === type) {
        // Same vote clicked - remove vote
        newStatus = null;
      } else {
        // New vote or changing vote
        newStatus = type;
      }

      // Optimistic update
      setVoteStatus(newStatus);

      // API'ye gönder
      const response = await axiosInstance.put(`/votes/${postId}`, {
        voteType: newStatus
      });

      // API'den gelen sonucu kullan
      if (response.data) {
        setVotes(response.data.votes);
        setVoteStatus(response.data.userVoteStatus);
      }

    } catch (err) {
      console.error('Oy verilirken hata oluştu:', err);
      // Hata durumunda yeniden yükle
      if (currentUser && currentUser.id) {
        fetchUserVoteStatus(currentUser.id);
      }
      alert('Oy verilirken hata oluştu');
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${postId}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) {
      try {
        setIsDeleting(true);
        
        await axiosInstance.delete(`/posts/${postId}`);
        window.location.reload();
      } catch (err) {
        console.error('Gönderi silinirken hata oluştu:', err);
        alert(err.response?.data?.message || 'Gönderi silinirken hata oluştu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const response = await axiosInstance.get(`/posts/${postId}/comments`);
      setComments(response.data || []);
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  const handleShowComments = (e) => {
    e.stopPropagation();
    setShowCommentsModal(true);
    fetchComments();
  };

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all mb-4 flex">
        {/* Vote Section - Left Side */}
        <div className="flex flex-col items-center justify-start pt-4 px-3 py-2 gap-1 border-r border-gray-700/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote('up');
            }}
            className={`p-2 hover:bg-gray-700/50 rounded transition ${voteStatus === 'up' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
            title="Yukarı Oyla"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3l7 7H3l7-7z" />
            </svg>
          </button>
          <span className={`text-sm font-bold ${voteStatus === 'up' ? 'text-orange-500' : voteStatus === 'down' ? 'text-blue-400' : 'text-gray-400'}`}>
            {votes >= 1000 ? `${(votes / 1000).toFixed(1)}k` : votes}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote('down');
            }}
            className={`p-2 hover:bg-gray-700/50 rounded transition ${voteStatus === 'down' ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}`}
            title="Aşağı Oyla"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 17l-7-7h14l-7 7z" />
            </svg>
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4 cursor-pointer group overflow-hidden" onClick={() => navigate(`/post/${post._id || post.id}`)}>
          {/* Header with Edit/Delete buttons */}
          <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
            <div className="flex items-center text-xs text-gray-500 min-w-0 overflow-hidden">
              <span className="font-bold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer transition truncate">
                r/{post.subreddit}
              </span>
              <span className="mx-1.5 flex-shrink-0">•</span>
              <span className="flex-shrink-0">Gönderen</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/${post.userId?._id || post.userId}`);
                }}
                className="ml-1 hover:underline cursor-pointer text-gray-400 hover:text-orange-400 transition truncate font-semibold"
              >
                u/{post.author || post.userId?.username || 'Bilinmiyor'}
              </button>
              <span className="mx-1.5 flex-shrink-0">•</span>
              <span className="flex-shrink-0">{post.timeAgo}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {isOwner && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 text-gray-400 hover:text-orange-400 hover:bg-gray-700/50 rounded-lg transition"
                    title="Düzenle"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition disabled:opacity-50"
                    title="Sil"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-100 mb-2 hover:text-orange-400 cursor-pointer transition line-clamp-2 break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>
            {post.title}
          </h3>

          {/* Content preview */}
          {post.content && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-3 break-words overflow-hidden" style={{ wordBreak: 'break-word' }}>{post.content}</p>
          )}

          {/* Image if exists */}
          {post.image && (
            <img
              src={getImageUrl(post.image)}
              alt={post.title}
              className="max-h-96 w-full object-cover rounded-lg mb-3 shadow-md hover:shadow-lg transition-shadow"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post._id || post.id}`);
              }}
              onError={(e) => {
                console.error('Resim yüklenemedi:', post.image);
                e.target.style.display = 'none';
              }}
            />
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-1 text-gray-400 text-xs font-semibold" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleShowComments}
              className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">{post.comments} Yorum</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">Paylaş</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCommentsModal(false)}>
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100">Yorumlar</h2>
              <button 
                onClick={() => setShowCommentsModal(false)}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {loadingComments ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.slice(0, 5).map((comment) => (
                    <div key={comment._id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-100">{comment.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="text-orange-400">u/{comment.userId?.username || 'Anonim'}</span>
                            {' '} • {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">{comment.content}</p>
                      {comment.image && (
                        <img 
                          src={getImageUrl(comment.image)}
                          alt="Yorum resmi" 
                          className="max-h-64 w-full object-cover rounded-lg mb-3 shadow-md hover:shadow-lg transition-shadow"
                          onError={(e) => {
                            console.error('Yorum resmi yüklenemedi:', comment.image);
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  ))}
                  {comments.length > 5 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">
                        +{comments.length - 5} daha fazla yorum
                      </p>
                      <button
                        onClick={() => {
                          navigate(`/post/${post._id || post.id}`);
                          setShowCommentsModal(false);
                        }}
                        className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition text-sm"
                      >
                        Tüm Yorumları Gör
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Henüz yorum yok</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostCard;
