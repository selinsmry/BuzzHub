import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

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
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-gray-200 placeholder-gray-500 text-sm transition-all"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Kullanıcı menüsü */}
          <div className="flex items-center space-x-3">
            <Link to="/communities" className="hidden md:flex items-center space-x-2 px-5 py-2 hover:bg-gray-800 rounded-xl transition text-sm font-semibold text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4 20h16c0-1.268-.63-2.39-1.593-3.068a8.003 8.003 0 016.41-3.07m0 0a8 8 0 11-16 0m16 0v2m0 0H4" />
              </svg>
              <span>Topluluklar</span>
            </Link>
            <Link to="/add" className="hidden md:flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all text-sm font-semibold shadow-lg shadow-orange-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Oluştur</span>
            </Link>
            <button className="p-2 hover:bg-gray-800 rounded-xl transition relative">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
            </button>
            <Link to="/profile" className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-800 rounded-xl cursor-pointer transition">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full ring-2 ring-gray-700 shadow-lg"></div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-200">Profilim</p>
                <p className="text-xs text-gray-500">ahmet_dev</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
