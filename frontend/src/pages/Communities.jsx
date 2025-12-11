import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CommunityCard from '../components/CommunityCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/communities`);
      setCommunities(response.data || []);
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      setError('Topluluklar yüklenemedi');
      setCommunities([
        { id: 1, name: 'programlama', members: 15000 },
        { id: 2, name: 'teknoloji', members: 20000 },
        { id: 3, name: 'oyun', members: 18000 },
        { id: 4, name: 'spor', members: 12000 },
        { id: 5, name: 'müzik', members: 8000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Topluluklar</h1>
          <p className="text-gray-400">Katılmak istediğiniz topluluğu bulun</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Topluluk ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-200 placeholder-gray-500"
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {/* Communities Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p className="text-lg">Topluluk bulunamadı</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Communities;
