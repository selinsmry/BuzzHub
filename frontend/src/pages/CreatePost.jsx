import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreatePost() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('text'); // text, link, image
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [subreddit, setSubreddit] = useState('programlama');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subreddits = [
    'programlama',
    'teknoloji',
    'oyun',
    'spor',
    'müzik',
    'kitap',
    'film',
    'seyahat',
  ];

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
      
      const postData = {
        title,
        subreddit,
        author: 'anonymous_user',
        timeAgo: 'az önce',
      };

      if (postType === 'text') {
        postData.content = content;
      } else if (postType === 'link') {
        postData.link = link;
      } else if (postType === 'image') {
        postData.image = link;
      }

      const response = await axios.post(`${apiUrl}/posts`, postData);
      
      if (response.status === 201 || response.status === 200) {
        setError('');
        setTitle('');
        setContent('');
        setLink('');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gönderi oluşturulurken hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pt-20">
      <div className="max-w-2xl mx-auto px-4">
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            >
              {subreddits.map((sub) => (
                <option key={sub} value={sub}>
                  r/{sub}
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
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <div className="text-xs text-gray-500 mt-2">
              {title.length} / 300
            </div>
          </div>

          {/* Content Area - Text */}
          {postType === 'text' && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                İçerik
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detaylı açıklamanızı yazın..."
                rows="8"
                maxLength={5000}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
              />
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <label className="block text-sm font-semibold text-gray-200 mb-4">
                Resim Yükle
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-orange-500 transition cursor-pointer">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 font-medium mb-1">Resim yüklemek için tıklayın</p>
                <p className="text-xs text-gray-600">veya sürükleyip bırakın</p>
                <input type="file" accept="image/*" className="hidden" />
              </div>
            </div>
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
