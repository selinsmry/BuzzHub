import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CommunityCard from '../components/CommunityCard';
import { getRecommendedCommunities } from '../api/recommendationApi';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendedCommunities();
      setRecommendations(data.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Öneriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  const handleUpdate = () => {
    fetchRecommendations();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Sizin İçin Önerilen Topluluklar</h1>
            <p className="text-gray-400">İlgi alanlarınıza dayalı kişiselleştirilmiş öneriler</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white rounded-lg transition flex items-center gap-2"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </button>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-orange-900/20 border border-orange-700/30 rounded-lg">
          <p className="text-orange-300 text-sm">
            💡 Öneriler, izlediğiniz topluluklar, harcadığınız zaman ve ilgi alanlarınız temelinde hesaplanır.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-400">Öneriler yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-8">
            <p className="text-red-300">Hata: {error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && !error && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <p className="text-gray-400 text-lg">Şu anda gösterilecek öneri yok</p>
            <p className="text-gray-500 text-sm mt-2">Daha fazla topluluk ziyaret ederek öneriler aldığınız zaman gelişecek</p>
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((community) => (
              <div key={community._id} className="relative">
                {/* Score Badge */}
                <div className="absolute top-2 right-2 z-10 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {community.recommendationScore?.toFixed(1) || 'N/A'}
                </div>
                <CommunityCard 
                  community={community} 
                  onUpdate={handleUpdate}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
