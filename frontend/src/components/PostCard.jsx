import { useState } from 'react';

function PostCard({ post }) {
  const [votes, setVotes] = useState(post.votes);
  const [voteStatus, setVoteStatus] = useState(null); // 'up', 'down', or null

  const handleVote = (type) => {
    if (voteStatus === type) {
      setVotes(post.votes);
      setVoteStatus(null);
    } else if (voteStatus === null) {
      setVotes(type === 'up' ? votes + 1 : votes - 1);
      setVoteStatus(type);
    } else {
      setVotes(type === 'up' ? votes + 2 : votes - 2);
      setVoteStatus(type);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all mb-4">
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center bg-gray-900/50 px-3 py-3 rounded-l-2xl">
          <button
            onClick={() => handleVote('up')}
            className={`p-1.5 hover:bg-gray-700 rounded-lg transition ${voteStatus === 'up' ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3l7 7H3l7-7z" />
            </svg>
          </button>
          <span className={`text-sm font-bold ${voteStatus === 'up' ? 'text-orange-500' : voteStatus === 'down' ? 'text-blue-400' : 'text-gray-300'}`}>
            {votes >= 1000 ? `${(votes / 1000).toFixed(1)}k` : votes}
          </span>
          <button
            onClick={() => handleVote('down')}
            className={`p-1.5 hover:bg-gray-700 rounded-lg transition ${voteStatus === 'down' ? 'text-blue-400' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 17l-7-7h14l-7 7z" />
            </svg>
          </button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span className="font-bold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer transition">
              r/{post.subreddit}
            </span>
            <span className="mx-1.5">•</span>
            <span>Gönderen</span>
            <span className="ml-1 hover:underline cursor-pointer text-gray-400 hover:text-gray-300 transition">u/{post.author}</span>
            <span className="mx-1.5">•</span>
            <span>{post.timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-100 mb-2 hover:text-orange-400 cursor-pointer transition">
            {post.title}
          </h3>

          {/* Content preview */}
          {post.content && (
            <p className="text-sm text-gray-400 mb-3 line-clamp-3">{post.content}</p>
          )}

          {/* Image if exists */}
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="max-h-96 w-auto rounded mb-2 cursor-pointer"
            />
          )}

          {/* Action buttons */}
          <div className="flex items-center space-x-1 text-gray-400 text-xs font-semibold">
            <button className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">{post.comments} Yorum</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">Paylaş</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-2 hover:bg-gray-700/50 rounded-xl transition group">
              <svg className="w-5 h-5 group-hover:text-orange-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="group-hover:text-gray-200 transition">Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;
