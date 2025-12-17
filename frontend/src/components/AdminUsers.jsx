import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { validation, validateForm, sanitizeInput } from '../utils/validation';
import { handleApiError } from '../utils/errorHandler';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', role: 'user' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/users');
      const usersData = (response.data || []).map((user, idx) => ({
        ...user,
        status: user.is_suspended ? 'suspended' : 'active',
        karma: user.karma_points || 0,
      }));
      setUsers(usersData);
      console.log('[ADMIN] Fetched users:', usersData);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('[ADMIN] Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert('✅ Kullanıcı başarıyla silindi');
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('[ADMIN] Error deleting user:', err);
      alert(`❌ Hata: ${errorMessage}`);
    }
  };

  const handleUpdateUser = async (userId) => {
    setFormErrors({});

    const validationRules = {
      username: validation.username,
      email: validation.email
    };

    const validationErrors = validateForm(formData, validationRules);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/users/${userId}`, {
        username: sanitizeInput(formData.username),
        email: sanitizeInput(formData.email),
        role: formData.role
      });
      setUsers(users.map(u => u._id === userId ? { ...u, ...formData } : u));
      setShowModal(false);
      setEditingUser(null);
      alert('✅ Kullanıcı başarıyla güncellendi');
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('[ADMIN] Error updating user:', err);
      alert(`❌ Hata: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const confirmMsg = newStatus === 'suspended' 
      ? 'Bu kullanıcıyı askıya almak istediğinize emin misiniz?' 
      : 'Bu kullanıcının askıya alınmasını kaldırmak istediğinize emin misiniz?';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const userData = users.find(u => u._id === userId);
      await axiosInstance.put(`/users/${userId}`, {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        is_suspended: newStatus === 'suspended',
        suspension_reason: newStatus === 'suspended' ? 'Admin tarafından askıya alındı' : null
      });
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus, is_suspended: newStatus === 'suspended' } : u));
      alert(`✅ Kullanıcı başarıyla ${newStatus === 'suspended' ? 'askıya alındı' : 'aktif duruma getirildi'}`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('Suspend error:', err);
      alert(`❌ Hata: ${errorMessage}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage and monitor all platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Kullanıcıyı Düzenle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full bg-gray-900/50 border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500/50 ${
                    formErrors.username ? 'border-red-500/50' : 'border-gray-700/50'
                  }`}
                />
                {formErrors.username && (
                  <p className="text-red-400 text-sm mt-1">⚠️ {formErrors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-gray-900/50 border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500/50 ${
                    formErrors.email ? 'border-red-500/50' : 'border-gray-700/50'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">⚠️ {formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500/50"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleUpdateUser(editingUser._id)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Karma</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-700/50 text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{user.karma || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Edit User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleSuspendUser(user._id, user.status)}
                        className="p-1.5 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title={user.status === 'suspended' ? "Unsuspend User" : "Suspend User"}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete User">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Moderators</p>
          <p className="text-2xl font-bold text-purple-400">{users.filter(u => u.role === 'moderator').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Suspended</p>
          <p className="text-2xl font-bold text-red-400">{users.filter(u => u.status === 'suspended').length}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
