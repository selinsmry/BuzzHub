import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function AdminModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    actionsThisWeek: 0,
    usersWarned: 0,
    usersBanned: 0,
    postsRemoved: 0,
  });
  const [selectedUser, setSelectedUser] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [warningReason, setWarningReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/posts');
      const postsData = (response.data.posts || response.data || []).slice(0, 5);
      setPosts(postsData);
      
      // Calculate mock stats based on data
      setStats({
        actionsThisWeek: postsData.length * 2,
        usersWarned: Math.floor(Math.random() * 10),
        usersBanned: Math.floor(Math.random() * 5),
        postsRemoved: Math.floor(Math.random() * 15),
      });
    } catch (err) {
      console.error('[ADMIN MODERATION] Error fetching data:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi kaldırmak istediğinize emin misiniz?')) return;
    try {
      await axiosInstance.delete(`/posts/${postId}`, {
        data: { userId: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser'))._id : null }
      });
      setPosts(posts.filter(p => p._id !== postId));
      setStats({ ...stats, postsRemoved: stats.postsRemoved + 1 });
      alert('Gönderi kaldırıldı');
    } catch (err) {
      console.error('[ADMIN MODERATION] Error removing post:', err);
      alert('İşlem sırasında hata oluştu');
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await axiosInstance.put(`/posts/${postId}`, {
        status: 'published'
      });
      setPosts(posts.filter(p => p._id !== postId));
      setStats({ ...stats, actionsThisWeek: stats.actionsThisWeek + 1 });
      alert('✅ Gönderi onaylandı');
    } catch (err) {
      console.error('[ADMIN MODERATION] Error approving post:', err);
      alert('❌ İşlem sırasında hata oluştu');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser.trim()) {
      alert('Lütfen bir kullanıcı adı girin');
      return;
    }
    if (window.confirm(`${selectedUser} kullanıcısını yasaklamak istediğinize emin misiniz?`)) {
      try {
        // Kullanıcıyı username'den bul
        const userResponse = await axiosInstance.get(`/users/username/${selectedUser}`);
        const user = userResponse.data;
        
        if (!user._id) {
          alert('❌ Kullanıcı bulunamadı');
          return;
        }
        
        // Backend'te ban işlemini yap
        await axiosInstance.put(`/users/${user._id}`, {
          username: user.username,
          email: user.email,
          role: user.role,
          is_suspended: true,
          suspension_reason: warningReason || 'Yönetim tarafından yasaklandı'
        });
        
        // Notification oluştur
        const notification = {
          id: Date.now(),
          type: 'error',
          title: '🚫 Hesap Yasaklandı',
          message: `Maalesef hesabınız yönetim kararı ile yasaklandı. ${warningReason ? `Neden: ${warningReason}` : 'Daha fazla bilgi için destek ekibiyle iletişime geçin.'}`,
          timestamp: new Date().toISOString(),
          targetUser: selectedUser
        };
        
        const userNotificationKey = `notifications_${selectedUser}`;
        const userNotifications = JSON.parse(localStorage.getItem(userNotificationKey) || '[]');
        userNotifications.push(notification);
        localStorage.setItem(userNotificationKey, JSON.stringify(userNotifications));
        
        setStats({ ...stats, usersBanned: stats.usersBanned + 1, actionsThisWeek: stats.actionsThisWeek + 1 });
        alert(`✅ ${selectedUser} kullanıcısı yasaklandı`);
        setSelectedUser('');
        setWarningReason('');
        setShowBanModal(false);
      } catch (err) {
        console.error('Ban error:', err);
        alert(`❌ Hata: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleRemovePostFromTools = async () => {
    if (posts.length === 0) {
      alert('İşlem yapabileceğiniz gönderi yok');
      return;
    }
    const postToRemove = posts[0];
    await handleRemovePost(postToRemove._id);
  };

  const handleSendWarning = () => {
    if (!selectedUser.trim() || !warningReason.trim()) {
      alert('Lütfen kullanıcı adı ve uyarı nedenini girin');
      return;
    }
    if (window.confirm(`${selectedUser} kullanıcısına uyarı göndermek istediğinize emin misiniz?`)) {
      // Notification oluştur ve hedef kullanıcıya gönder
      const notification = {
        id: Date.now(),
        type: 'warning',
        title: '⚠️ Yönetici Uyarısı',
        message: `Uyarı Nedeni: ${warningReason}`,
        timestamp: new Date().toISOString(),
        targetUser: selectedUser // Uyarı alan kullanıcı
      };
      
      // Hedef kullanıcının notification'ını localStorage'a ekle
      const userNotificationKey = `notifications_${selectedUser}`;
      const userNotifications = JSON.parse(localStorage.getItem(userNotificationKey) || '[]');
      userNotifications.push(notification);
      localStorage.setItem(userNotificationKey, JSON.stringify(userNotifications));
      
      // Admin tarafı
      setStats({ ...stats, usersWarned: stats.usersWarned + 1, actionsThisWeek: stats.actionsThisWeek + 1 });
      alert(`✅ ${selectedUser} kullanıcısına uyarı gönderildi: ${warningReason}`);
      setSelectedUser('');
      setWarningReason('');
    }
  };

  const handleApproveContentFromTools = () => {
    if (posts.length === 0) {
      alert('İşlem yapabileceğiniz gönderi yok');
      return;
    }
    handleApprovePost(posts[0]._id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Moderation Center</h1>
        <p className="text-gray-400">Review and manage moderation actions</p>
      </div>

      {/* Recent Posts to Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>📋</span>
          <span>Recent Posts for Review</span>
        </h2>

        {posts.length > 0 ? posts.map((post) => (
          <div key={post._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-pink-500/20">
                  📝
                </div>
                <div>
                  <p className="text-white font-medium">{post.title}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{post.content || 'No content'}</p>
                  <p className="text-gray-500 text-xs mt-1">By {post.author || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  pending
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleRemovePost(post._id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Remove
              </button>
              <button
                onClick={() => handleApprovePost(post._id)}
                className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm font-medium">
                Approve
              </button>
              <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No posts to review</p>
          </div>
        )}
      </div>

      {/* Moderation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">🛠️ Moderation Tools</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setShowBanModal(true)}
              className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/30 text-sm font-medium">
              Ban User
            </button>
            <button 
              onClick={handleRemovePostFromTools}
              className="w-full px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/30 text-sm font-medium">
              Remove Post
            </button>
            <button 
              onClick={() => setShowBanModal(true)}
              className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors border border-orange-500/30 text-sm font-medium">
              Send Warning
            </button>
            <button 
              onClick={handleApproveContentFromTools}
              className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors border border-green-500/30 text-sm font-medium">
              Approve Content
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">📊 Moderation Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Actions This Week</span>
              <span className="text-white font-bold">{stats.actionsThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Warned</span>
              <span className="text-yellow-400 font-bold">{stats.usersWarned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Banned</span>
              <span className="text-red-400 font-bold">{stats.usersBanned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Posts Removed</span>
              <span className="text-orange-400 font-bold">{stats.postsRemoved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ban/Warning Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl p-4">
          <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Moderation Action</h2>
            
            <div className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="örn: user123"
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Reason/Warning Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Uyarı Nedeni (isteğe bağlı)</label>
                <textarea
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="Neden uyarı/ban veriyorsunuz?"
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  rows="3"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={handleBanUser}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium border border-red-500/30"
                >
                  Ban
                </button>
                <button
                  onClick={handleSendWarning}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors text-sm font-medium border border-orange-500/30"
                >
                  Uyar
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser('');
                  setWarningReason('');
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium mt-2"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminModeration;
