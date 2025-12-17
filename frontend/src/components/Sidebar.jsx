import { useState, useEffect } from 'react';
import axios from 'axios';

function Sidebar() {
  const [popularCommunities, setPopularCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/communities`);
      const communitiesList = response.data.communities || [];
      
      // İlk 5 topluluğu al
      const topCommunities = communitiesList.slice(0, 5).map((community, index) => ({
        ...community,
        icon: ['💻', '⚡', '🎮', '🎵', '⚽'][index] || '📌'
      }));
      
      setPopularCommunities(topCommunities);
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      // Fallback topluluklar
      setPopularCommunities([
        { name: 'teknoloji', members: '1.2M', icon: '💻' },
        { name: 'programlama', members: '850K', icon: '⚡' },
        { name: 'oyun', members: '2.1M', icon: '🎮' },
        { name: 'müzik', members: '1.8M', icon: '🎵' },
        { name: 'spor', members: '950K', icon: '⚽' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Popular Communities */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-orange-500/10 to-pink-500/10">
          <h3 className="font-bold text-sm text-gray-200">Popüler Topluluklar</h3>
        </div>
        <div className="divide-y divide-gray-700/30">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <p className="text-xs mt-2">Yükleniyor...</p>
            </div>
          ) : (
            popularCommunities.map((community, index) => (
              <div
                key={community._id || community.name}
                className="flex items-center justify-between p-3.5 hover:bg-gray-700/30 cursor-pointer transition group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-500 w-4">{index + 1}</span>
                  <span className="text-2xl">{community.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-200 group-hover:text-orange-400 transition">r/{community.name}</p>
                    <p className="text-xs text-gray-500">{community.members || 'Üye bilgisi yok'}</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg shadow-orange-500/20">
                  Katıl
                </button>
              </div>
            ))
          )}
        </div>
        <button className="w-full p-3 text-sm text-orange-400 hover:bg-gray-700/30 font-semibold transition">
          Tümünü Gör
        </button>
      </div>

      {/* Footer */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <a href="#" className="hover:text-orange-400 hover:underline transition">Kullanıcı Sözleşmesi</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">Gizlilik Politikası</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">İçerik Politikası</a>
          <span>•</span>
          <a href="#" className="hover:text-orange-400 hover:underline transition">Moderatör Kuralları</a>
        </div>
        <p className="text-xs text-gray-600 mt-3">BuzzHub, Inc. © 2025</p>
      </div>
    </div>
  );
}

export default Sidebar;
