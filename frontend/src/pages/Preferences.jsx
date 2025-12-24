import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { updateUserPreferences } from '../api/recommendationApi';
import axiosInstance from '../api/axiosInstance';

function PreferencesPage() {
  const [categories, setCategories] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch communities from database to use as suggested categories
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/communities');
      const communities = response.data.communities || response.data || [];
      const communityNames = communities
        .map(c => c.name)
        .filter(name => name) // Filter out empty names
        .slice(0, 20); // Limit to 20 communities
      setSuggestedCategories(communityNames);
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      setSuggestedCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const addCategory = () => {
    const trimmed = input.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setInput('');
      setError(null);
    } else if (categories.includes(trimmed)) {
      setError('Bu kategori zaten eklendi');
    }
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const toggleSuggested = (category) => {
    if (categories.includes(category)) {
      removeCategory(categories.indexOf(category));
    } else {
      setCategories([...categories, category]);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (categories.length === 0) {
      setError('En az bir kategori seçiniz');
      return;
    }

    try {
      setSavingLoading(true);
      setError(null);
      await updateUserPreferences(categories);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Tercihler kaydedilemedi');
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">İlgi Alanları</h1>
          <p className="text-gray-400">İlgi alanlarınızı seçerek daha iyi öneriler alın</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-300">✓ Tercihleriniz başarıyla kaydedildi</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 mb-8">
          {/* Selected Categories */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Seçili Kategoriler</h2>
            {categories.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz bir kategori seçilmedi</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-full"
                  >
                    <span>{category}</span>
                    <button
                      onClick={() => removeCategory(index)}
                      className="text-orange-300 hover:text-orange-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Category Input */}
          <div className="mb-8 pb-8 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Kendi Kategorinizi Ekleyin</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Kategori adını yazın..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-200 placeholder-gray-500"
              />
              <button
                onClick={addCategory}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Suggested Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Önerilen Kategoriler</h3>
              <button
                onClick={fetchCommunities}
                disabled={loadingCategories}
                className="text-xs text-gray-400 hover:text-orange-400 transition disabled:opacity-50"
                title="Yenile"
              >
                ↻
              </button>
            </div>
            
            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <p className="text-gray-400 text-sm ml-3">Topluluklar yükleniyor...</p>
              </div>
            ) : suggestedCategories.length === 0 ? (
              <p className="text-gray-400 text-sm">Hiç topluluk bulunamadı</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {suggestedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleSuggested(category)}
                    className={`py-2 px-4 rounded-lg transition font-medium text-sm truncate ${
                      categories.includes(category)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={savingLoading || categories.length === 0}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white rounded-lg transition font-medium disabled:cursor-not-allowed"
          >
            {savingLoading ? 'Kaydediliyor...' : 'Tercihler Kaydedilsin'}
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <h4 className="text-blue-300 font-semibold mb-2">💡 Bilgi</h4>
          <ul className="text-blue-300/80 text-sm space-y-1">
            <li>• Seçtiğiniz kategoriler topluluk önerilerini etkileyecek</li>
            <li>• Ziyaret ettiğiniz topluluklarda harcadığınız zaman otomatik olarak kaydedilir</li>
            <li>• Daha fazla etkileşim = Daha iyi öneriler</li>
            <li>• İstediğiniz zaman tercihlerinizi güncelleyebilirsiniz</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PreferencesPage;
