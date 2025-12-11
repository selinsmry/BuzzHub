function ProfileHeader({ user }) {
  return (
    <div className="mb-6">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-orange-500/20 to-pink-600/20 rounded-2xl relative border border-orange-500/20"></div>

      {/* Profile Info */}
      <div className="flex items-end gap-4 px-6 pb-4 -mt-16 relative z-10">
        {/* Avatar */}
        <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl ring-4 ring-gray-900 shadow-2xl"></div>

        {/* User Info */}
        <div className="flex-1 mb-2">
          <h1 className="text-3xl font-bold text-gray-100">{user.name}</h1>
          <p className="text-lg text-gray-400">u/{user.username}</p>
          <p className="text-sm text-gray-500 mt-1">Üye {user.joinDate}</p>
        </div>

        {/* Action Buttons (follow feature removed) */}
        <div className="flex gap-3 mb-2">
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 py-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 mt-4">
        <p className="text-gray-300 leading-relaxed">
          {user.bio}
        </p>
        <div className="flex gap-6 mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{user.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>{user.website}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
