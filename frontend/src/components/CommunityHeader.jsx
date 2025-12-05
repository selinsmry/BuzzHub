function CommunityHeader() {
  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-pink-600/20 border-b border-gray-700/50 py-8 mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-4xl">🏘️</div>
          <h1 className="text-3xl font-bold text-gray-100">Topluluklar</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Türkiye'nin en canlı toplulukları keşfedin, ilgi alanlarınız hakkında konuşun ve yeni insanlarla bağlantı kurun.
        </p>
      </div>
    </div>
  );
}

export default CommunityHeader;
