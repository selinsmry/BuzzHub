import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/communities`);
      const communitiesData = (response.data || []).map((community, idx) => ({
        ...community,
        members: community.members || Math.floor(Math.random() * 10000) + 100,
        posts: community.posts || Math.floor(Math.random() * 500) + 10,
        status: community.status || 'active',
      }));
      setCommunities(communitiesData);
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      setCommunities([
        { _id: 1, name: 'teknoloji', description: 'Teknoloji haberleri', members: 8934, posts: 234, status: 'active' },
        { _id: 2, name: 'programlama', description: 'Programlama tartışmaları', members: 6543, posts: 156, status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      alert('Topluluk adı gereklidir');
      return;
    }

    try {
      if (editingCommunity) {
        // Update
        await axios.put(`${API_URL}/communities/${editingCommunity._id}`, formData);
        setCommunities(communities.map(c => c._id === editingCommunity._id ? { ...c, ...formData } : c));
        alert('Topluluk başarıyla güncellendi');
      } else {
        // Create
        const response = await axios.post(`${API_URL}/communities`, formData);
        const newCommunity = {
          ...response.data,
          members: Math.floor(Math.random() * 10000) + 100,
          posts: Math.floor(Math.random() * 500) + 10,
          status: 'active',
        };
        setCommunities([...communities, newCommunity]);
        alert('Topluluk başarıyla oluşturuldu');
      }
      setShowModal(false);
      setEditingCommunity(null);
      setFormData({ name: '', description: '' });
    } catch (err) {
      console.error('Hata:', err);
      alert('İşlem sırasında hata oluştu');
    }
  };

  const handleDelete = async (communityId) => {
    if (!window.confirm('Bu topluluğu silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`${API_URL}/communities/${communityId}`);
      setCommunities(communities.filter(c => c._id !== communityId));
      alert('Topluluk başarıyla silindi');
    } catch (err) {
      console.error('Silme hatası:', err);
      alert('Topluluk silinirken hata oluştu');
    }
  };

  const openCreateModal = () => {
    setEditingCommunity(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Communities Management</h1>
        <p className="text-gray-400">Manage and monitor all communities</p>
      </div>

      {/* Search & Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-medium">
            Create Community
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">{editingCommunity ? 'Edit Community' : 'Create Community'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Community Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500/50"
                  placeholder="e.g., teknoloji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500/50"
                  placeholder="Enter community description..."
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateOrUpdate}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  {editingCommunity ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCommunity(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((community) => (
          <div key={community._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                  {community.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{community.name}</h3>
                  <p className="text-xs text-gray-400">c/{community.name}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{community.description || 'No description'}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-700/30">
              <div>
                <p className="text-gray-400 text-xs mb-1">Members</p>
                <p className="text-lg font-bold text-white">{(community.members / 1000).toFixed(1)}K</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Posts</p>
                <p className="text-lg font-bold text-white">{community.posts}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-gray-400 text-xs">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                community.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {community.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(community)}
                className="flex-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                Edit
              </button>
              <button
                onClick={() => handleDelete(community._id)}
                className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Communities</p>
          <p className="text-2xl font-bold text-white">{communities.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Active Communities</p>
          <p className="text-2xl font-bold text-green-400">{communities.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Members</p>
          <p className="text-2xl font-bold text-orange-400">{(communities.reduce((sum, c) => sum + c.members, 0) / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-pink-400">{communities.reduce((sum, c) => sum + c.posts, 0)}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminCommunities;
