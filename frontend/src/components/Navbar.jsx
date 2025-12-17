import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';

function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // localStorage'den kullanıcı bilgisini al
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Arama:', searchQuery);
    }
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4\">
        <div className="flex items-center justify-between h-14\">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition\">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30\">
              <span className="text-white font-bold text-xl\">B</span>
            </div>
            <span className="font-bold text-xl hidden sm:block bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">BuzzHub</span>
          </Link>

          {/* Arama */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Topluluk, gönderi veya kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-200 placeholder-gray-500 text-sm transition-all"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Kullanıcı menüsü */}
          <div className="flex items-center space-x-3">
            {!currentUser ? (
              <>
                <Link to="/login" className="hidden md:flex items-center space-x-2 px-5 py-2 hover:bg-gray-800 rounded-xl transition text-sm font-semibold text-gray-300">
                  <span>Giriş Yap</span>
                </Link>
                <Link to="/register" className="hidden md:flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all text-sm font-semibold shadow-lg shadow-orange-500/20">
                  <span>Kayıt Ol</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/communities" className="hidden md:flex items-center space-x-2 px-5 py-2 hover:bg-gray-800 rounded-xl transition text-sm font-semibold text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16c0-1.268-.63-2.39-1.593-3.068a8.003 8.003 0 016.41-3.07m0 0a8 8 0 11-16 0m16 0v2m0 0H4" />
                  </svg>
                  <span>Topluluklar</span>
                </Link>
                <Link to="/create-post" className="hidden md:flex items-center space-x-2 px-5 py-2 hover:bg-gray-800 rounded-xl transition text-sm font-semibold text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Gönderi</span>
                </Link>
                <Link to="/create-community" className="hidden md:flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all text-sm font-semibold shadow-lg shadow-orange-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Topluluk Oluştur</span>
                </Link>
              </>
            )}
            
            {/* Notification Center */}
            {currentUser && <NotificationCenter />}

            {/* User Menu */}
            {currentUser && (
              <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-800 rounded-xl cursor-pointer transition">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full ring-2 ring-gray-700 shadow-lg"></div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-200">{currentUser.username}</p>
                  <p className="text-xs text-gray-500">{currentUser.role === 'admin' ? 'Admin' : 'Kullanıcı'}</p>
                </div>
              </Link>
            )}

            {/* Logout Button */}
            {currentUser && (
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-xl transition text-red-400 hover:text-red-300"
                title="Çıkış Yap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
