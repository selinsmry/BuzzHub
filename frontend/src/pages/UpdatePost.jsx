import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function UpdatePost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [postType, setPostType] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // Mevcut kullanıcıyı al
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  // Toplulukları backend'den çek
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/communities`);
      const communitiesList = response.data.communities || response.data || [];
      console.log('Fetched communities:', communitiesList);
      setCommunities(communitiesList);
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      console.error('Error details:', err.response?.data || err.message);
      // Fallback olarak varsayılan toplulukları kullan
      const defaultCommunities = [
        { name: 'programlama' },
        { name: 'teknoloji' },
        { name: 'oyun' },
        { name: 'spor' },
        { name: 'müzik' },
        { name: 'kitap' },
        { name: 'film' },
        { name: 'seyahat' },
      ];
      setCommunities(defaultCommunities);
    } finally {
      setLoadingCommunities(false);
    }
  };

  // Gönderiyi yükle
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${apiUrl}/posts/${id}`);
        const fetchedPost = response.data;
        setPost(fetchedPost);

        setTitle(fetchedPost.title);
        setContent(fetchedPost.content || '');
        setLink(fetchedPost.image || fetchedPost.link || '');
        setSubreddit(fetchedPost.subreddit);
        setVotes(fetchedPost.votes || 0);
        setComments(fetchedPost.comments || 0);
        
        // Gönderi tipini belirle
        if (fetchedPost.image) {
          setPostType('image');
        } else if (fetchedPost.link) {
          setPostType('link');
        } else {
          setPostType('text');
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Gönderi yüklenirken hata oluştu');
        console.error('Error fetching post:', err);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lütfen başlık girin');
      return;
    }

    if (postType === 'text' && !content.trim()) {
      setError('Lütfen içerik girin');
      return;
    }

    if (postType === 'link' && !link.trim()) {
      setError('Lütfen link girin');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Mevcut kullanıcı bilgisini al
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const updateData = {
        title,
        subreddit,
        userId: currentUser.id,
      };

      if (postType === 'text') {
        updateData.content = content;
      } else if (postType === 'link') {
        updateData.link = link;
      } else if (postType === 'image') {
        updateData.image = link;
      }

      const response = await axios.put(`${apiUrl}/posts/${id}`, updateData);

      if (response.status === 200) {
        setError('');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gönderi güncellenirken hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Error updating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-400 mt-4">Gönderi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Gönderiyi Düzenle</h1>
          <p className="text-gray-400">Gönderi bilgilerinizi güncelleyin</p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gönderi başlığı..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-500"
            />
          </div>

          {/* Subreddit Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Topluluk
            </label>
            <select
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            >
              <option value="">Bir topluluk seçin</option>
              {communities.map((community) => (
                <option key={community._id || community.name} value={community.name || community}>
                  r/{community.name || community}
                </option>
              ))}
            </select>
          </div>

          {/* Post Type Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-gray-200 mb-4">
              Gönderi Türü
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'text', icon: '📝', label: 'Metin' },
                { type: 'link', icon: '🔗', label: 'Link' },
                { type: 'image', icon: '🖼️', label: 'Resim' },
              ].map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setPostType(option.type)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    postType === option.type
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content based on type */}
          {postType === 'text' && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                İçerik
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Gönderi içeriğini yazın..."
                rows="6"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-500 resize-none"
              />
            </div>
          )}

          {(postType === 'link' || postType === 'image') && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                {postType === 'link' ? 'Link URL' : 'Resim URL'}
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={postType === 'link' ? 'https://example.com' : 'https://example.com/image.jpg'}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-500"
              />
            </div>
          )}

          {/* Votes and Comments - Display Only */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Oylar
              </label>
              <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100">
                <p className="text-lg font-semibold">{votes}</p>
                <p className="text-xs text-gray-400 mt-1">Salt okunur - değiştirilemez</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Yorumlar
              </label>
              <div className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-100">
                <p className="text-lg font-semibold">{comments}</p>
                <p className="text-xs text-gray-400 mt-1">Salt okunur - değiştirilemez</p>
              </div>
            </div>
          </div>k

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-800/50 text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdatePost;
