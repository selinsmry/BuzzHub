import { useState } from 'react';
import { updateUserProfile } from '../api/userApi';

function EditProfileModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: user.username || '',
    bio: user.bio || '👤 BuzzHub Kullanıcısı',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateUserProfile({
        username: formData.username,
        bio: formData.bio,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(response.user);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      console.error('Hata detayları:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
      setError(err.response?.data?.error || `Profil güncellenemedi (${err.response?.status || 'Hata'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Profili Düzenle</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
              ✓ Profil başarıyla güncellendi!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                maxLength="30"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Kullanıcı adınız..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.username.length}/30
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biyografi
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength="150"
                rows="4"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Kendinizden bahsedin..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/150
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
