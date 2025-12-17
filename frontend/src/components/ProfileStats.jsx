import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PostCard from './PostCard';

function ProfileStats({ user }) {
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Link 
          to={`/profile/${user.id}/followers`}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center hover:border-orange-400/50 transition cursor-pointer group"
        >
          <p className="text-3xl font-bold text-orange-400 group-hover:text-orange-300">{user.stats.followers}</p>
          <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300">Takipçi</p>
        </Link>
        <Link 
          to={`/profile/${user.id}/following`}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center hover:border-pink-400/50 transition cursor-pointer group"
        >
          <p className="text-3xl font-bold text-pink-400 group-hover:text-pink-300">{user.stats.following}</p>
          <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300">Takip Edilen</p>
        </Link>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{user.stats.postCount}</p>
          <p className="text-gray-400 text-sm mt-1">Gönderi</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{user.stats.commentCount}</p>
          <p className="text-gray-400 text-sm mt-1">Yorum</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700/50 pb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'posts'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gönderiler
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'comments'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Yorumlar
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'saved'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Kaydedilen
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4 pb-20">
          {user.posts && user.posts.length > 0 ? (
            user.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400">Gönderi yok</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div>
          {user.comments && user.comments.length > 0 ? (
            <div className="space-y-4">
              {user.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition cursor-pointer" onClick={() => comment.postId && navigate(`/posts/${comment.postId}`)}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-100 break-words">{comment.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{comment.timeAgo}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 line-clamp-3 break-words">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">Yorum yok</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center pb-20">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-gray-400">Kaydedilen gönderi yok</p>
        </div>
      )}
    </div>
  );
}

export default ProfileStats;
