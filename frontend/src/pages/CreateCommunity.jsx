import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function CreateCommunity() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Kullanıcı giriş yaptığını kontrol et
  useState(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Lütfen topluluk adı girin');
      return;
    }

    if (name.trim().length < 3) {
      setError('Topluluk adı en az 3 karakter olmalıdır');
      return;
    }

    if (name.trim().length > 50) {
      setError('Topluluk adı en fazla 50 karakter olmalıdır');
      return;
    }

    setIsSubmitting(true);

    try {
      const communityData = {
        name: name.trim().toLowerCase(),
        description: description.trim() || '',
      };

      const response = await axios.post(`${API_URL}/communities`, communityData);

      if (response.status === 201) {
        setError('');
        setName('');
        setDescription('');
        navigate('/communities');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Bu topluluk adı zaten kullanılıyor');
      } else {
        setError(err.response?.data?.message || 'Topluluk oluşturulurken hata oluştu. Lütfen tekrar deneyiniz.');
      }
      console.error('Error creating community:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Yeni Topluluk Oluştur</h1>
          <p className="text-gray-400">Kendi topluluğunuzu kurun ve isteğinize göre yönetin</p>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 space-y-6">
          {/* Error Message Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Topluluk Adı <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">r/</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ornek-topluluk"
                  maxLength={50}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {name.length} / 50 karakter
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Topluluk adı küçük harfle, tire ve rakamlarla yazılabilir
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topluluğunuzun ne hakkında olduğunu açıklayın... (opsiyonel)"
                maxLength={500}
                rows="5"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
              />
              <div className="text-xs text-gray-500 mt-2">
                {description.length} / 500 karakter
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM5 8a1 1 0 000 2h8a1 1 0 100-2H5zm7 4a1 1 0 110 2H5a1 1 0 110-2h7z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-300 mb-1">İpuçları:</p>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Topluluk adını dikkatli seçin, sonra değiştiremezsiniz</li>
                    <li>• Daha sonra üyeleri davet ederek topluluğu büyütebilirsiniz</li>
                    <li>• Topluluğa moderatör atayabilir ve kurallar belirleyebilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/communities')}
                className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                İptal Et
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Topluluğu Oluştur'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-gray-800/30 border border-gray-700/30 rounded-2xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Topluluk Oluşturduktan Sonra Ne Yapabilirsiniz?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-semibold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Üyeleri yönetin</p>
                <p className="text-xs text-gray-500">Üyeler ekleyin veya kaldırın</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-semibold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Kurallar belirleyin</p>
                <p className="text-xs text-gray-500">Topluluk kurallarını yazın</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-semibold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Moderatör atayın</p>
                <p className="text-xs text-gray-500">Topluluğu yönetmesi için moderatör seçin</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-400 font-semibold">4</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Gönderi paylaşın</p>
                <p className="text-xs text-gray-500">Topluluğa özel gönderiler yayınlayın</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCommunity;
