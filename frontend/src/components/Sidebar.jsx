function Sidebar() {
  const popularCommunities = [
    { name: 'teknoloji', members: '1.2M', icon: '💻' },
    { name: 'programlama', members: '850K', icon: '⚡' },
    { name: 'oyun', members: '2.1M', icon: '🎮' },
    { name: 'müzik', members: '1.8M', icon: '🎵' },
    { name: 'spor', members: '950K', icon: '⚽' },
  ];

  return (
    <div className="space-y-4">
      {/* Create Post Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full ring-2 ring-gray-700"></div>
          <span className="text-sm font-semibold text-gray-200">Giriş Yap</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Favori topluluklarını takip et, gönderi oluştur ve daha fazlası!
        </p>
        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-2.5 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg shadow-orange-500/20">
          Giriş Yap
        </button>
        <button className="w-full border-2 border-orange-500/50 text-orange-400 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-500/10 hover:border-orange-500 transition-all mt-3">
          Kayıt Ol
        </button>
      </div>

      {/* Popular Communities */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-orange-500/10 to-pink-500/10">
          <h3 className="font-bold text-sm text-gray-200">Popüler Topluluklar</h3>
        </div>
        <div className="divide-y divide-gray-700/30">
          {popularCommunities.map((community, index) => (
            <div
              key={community.name}
              className="flex items-center justify-between p-3.5 hover:bg-gray-700/30 cursor-pointer transition group"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-gray-500 w-4">{index + 1}</span>
                <span className="text-2xl">{community.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-orange-400 transition">r/{community.name}</p>
                  <p className="text-xs text-gray-500">{community.members} üye</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xs font-bold rounded-xl hover:from-orange-600 hover:to-pink-700 transition-all shadow-lg shadow-orange-500/20">
                Katıl
              </button>
            </div>
          ))}
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
