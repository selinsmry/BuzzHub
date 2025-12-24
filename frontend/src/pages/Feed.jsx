import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { getPersonalizedFeed } from '../api/recommendationApi';

function PersonalizedFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPersonalizedFeed();
      setPosts(data.data || []);
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Beslenme yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Kişiselleştirilmiş Beslenme</h1>
            <p className="text-gray-400">İlgi alanlarınıza göre seçilmiş gönderiler</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
            title="Yenile"
          >
            <svg className={`w-6 h-6 text-orange-500 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-gradient-to-r from-orange-900/30 to-orange-900/10 border border-orange-700/30 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-orange-300 text-sm">
              <strong>Kişiselleştirilmiş beslenme</strong> sizin izlediğiniz topluluklar ve önerilen topluluklar temelinde oluşturulur.
            </p>
            <p className="text-orange-300/70 text-xs mt-1">
              İlgi alanlarınızı güncellemek için <a href="/preferences" className="underline hover:text-orange-200">Tercihler</a> sayfasını ziyaret edin.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-400">Beslenme yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-8">
            <p className="text-red-300 font-medium mb-3">Hata: {error}</p>
            <button
              onClick={fetchFeed}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm transition"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
          <div className="text-center py-32">
            <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v4m0 0a2 2 0 012 2v4a2 2 0 01-2 2m0 0V9m0 4a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg font-medium">Henüz gösterilecek gönderi yok</p>
            <p className="text-gray-500 text-sm mt-2">Daha fazla topluluk ziyaret ederek ve tercihler belirleyerek beslenmeyi doldurmaya başlayın</p>
            <div className="mt-6 flex gap-4 justify-center">
              <a
                href="/communities"
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
              >
                Toplulukları Keşfet
              </a>
              <a
                href="/preferences"
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Tercihler Ayarla
              </a>
            </div>
          </div>
        )}

        {/* Posts List */}
        {!loading && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition">
                <PostCard post={post} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && posts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 text-white rounded-lg transition"
            >
              {refreshing ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonalizedFeed;
