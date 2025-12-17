import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { validation, validateForm, sanitizeInput } from '../utils/validation';
import { handleApiError } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function CreatePost() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${API_URL}/communities`);
      const communitiesList = response.data.communities || response.data || [];
      console.log('Fetched communities:', communitiesList);
      setCommunities(communitiesList);
      if (communitiesList.length > 0) {
        setSubreddit(communitiesList[0]._id || communitiesList[0].name || communitiesList[0]);
      }
    } catch (err) {
      console.error('Topluluklar yüklenirken hata:', err);
      console.error('Error details:', err.response?.data || err.message);
      const defaultCommunities = [
        { name: 'programlama' },
        { name: 'teknoloji' },
        { name: 'oyun' },
        { name: 'spor' },
        { name: 'müzik' },
      ];
      setCommunities(defaultCommunities);
      setSubreddit('programlama');
    } finally {
      setLoadingCommunities(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Resim boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const validationRules = {
      title: validation.postTitle
    };

    if (postType === 'text') {
      validationRules.content = validation.postContent;
    }

    const formData = {
      title: sanitizeInput(title),
      content: postType === 'text' ? sanitizeInput(content) : '',
      link: postType !== 'text' ? sanitizeInput(link) : ''
    };

    const validationErrors = validateForm(formData, validationRules);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      // Use FormData for file upload
      const requestData = new FormData();
      requestData.append('title', sanitizeInput(title));
      requestData.append('subreddit', subreddit);
      requestData.append('communityId', subreddit);
      requestData.append('author', currentUser.username || 'anonymous_user');
      requestData.append('userId', currentUser.id || null);

      if (postType === 'text') {
        requestData.append('content', sanitizeInput(content));
      } else if (postType === 'link') {
        requestData.append('link', sanitizeInput(link));
      } else if (postType === 'image') {
        if (imageFile) {
          requestData.append('image', imageFile);
        } else {
          setError('Lütfen bir resim seçin');
          setIsSubmitting(false);
          return;
        }
      }

      const response = await axios.post(`${API_URL}/posts`, requestData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        setTitle('');
        setContent('');
        setLink('');
        setImageFile(null);
        setImagePreview('');
        navigate('/');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Yeni Gönderi Oluştur</h1>
          <p className="text-gray-400">BuzzHub topluluğunuza yeni bir gönderi paylaşın</p>
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
          {/* Subreddit Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Topluluk Seçin
            </label>
            <select
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              disabled={loadingCommunities}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
            >
              {loadingCommunities ? (
                <option>Yükleniyor...</option>
              ) : communities.length > 0 ? (
                communities.map((community) => {
                  const communityName = typeof community === 'string' ? community : community.name;
                  return (
                    <option key={communityName} value={communityName}>
                      {communityName}
                    </option>
                  );
                })
              ) : (
                <option>Topluluk bulunamadı</option>
              )}
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
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-semibold text-gray-300">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-gray-200 mb-3">
              Başlık <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gönderin başlığını yazın..."
              maxLength={300}
              className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-orange-500/20 transition-all ${
                errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.title}
              </p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {title.length} / 300
            </div>
          </div>

          {/* Content Area - Text */}
          {postType === 'text' && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                İçerik <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detaylı açıklamanızı yazın..."
                rows="8"
                maxLength={5000}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-gray-100 placeholder-gray-600 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none ${
                  errors.content ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                }`}
              />
              {errors.content && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.content}
                </p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {content.length} / 5000
              </div>
            </div>
          )}

          {/* Link Input */}
          {postType === 'link' && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Geçerli bir URL formatı girin (https://...)
              </p>
            </div>
          )}

          {/* Image Upload */}
          {postType === 'image' && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-gray-200 mb-4">
                  Resim Yükle <span className="text-red-400">*</span>
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full max-h-96 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg p-2 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-orange-500 transition cursor-pointer block">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 font-medium mb-1">Resim yüklemek için tıklayın</p>
                    <p className="text-xs text-gray-600">veya sürükleyip bırakın</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Max dosya boyutu: 5MB (JPEG, PNG, GIF, WebP)
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Açıklama / Yorum
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Resim hakkında yorum veya açıklama yazın..."
                  rows="4"
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
                <div className="text-xs text-gray-500 mt-2">
                  {content.length} / 2000
                </div>
              </div>
            </>
          )}

          {/* Settings */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Yorumları aç
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer mt-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-300">
                Bu gönderiyi sabitle
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              İptal Et
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? 'Yükleniyor...' : 'Gönderiyi Yayınla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
