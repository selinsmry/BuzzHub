import { useState } from 'react';

function AdminModeration() {
  const [moderationItems] = useState([
    { id: 1, type: 'user', target: 'SpamBot123', reason: 'Spam and promotional content', severity: 'high', action: 'suspended', date: '2 hours ago' },
    { id: 2, type: 'post', target: 'Post #4521', reason: 'Hate speech detected', severity: 'critical', action: 'removed', date: '4 hours ago' },
    { id: 3, type: 'comment', target: 'Comment #8932', reason: 'Misinformation', severity: 'medium', action: 'flagged', date: '6 hours ago' },
    { id: 4, type: 'user', target: 'TrollAccount99', reason: 'Harassment and bullying', severity: 'high', action: 'warned', date: '1 day ago' },
    { id: 5, type: 'post', target: 'Post #4398', reason: 'NSFW content', severity: 'medium', action: 'hidden', date: '1 day ago' },
  ]);

  const [pendingActions] = useState([
    { id: 1, type: 'review_request', content: 'Post reported by 5 users', priority: 'high', status: 'pending' },
    { id: 2, type: 'appeal', content: 'User appeal: Ban on SpamBot123', priority: 'medium', status: 'pending' },
    { id: 3, type: 'auto_flag', content: 'AI flagged suspicious activity', priority: 'low', status: 'reviewing' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Moderation Center</h1>
        <p className="text-gray-400">Review and manage moderation actions</p>
      </div>

      {/* Moderation Actions History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>📋</span>
          <span>Recent Moderation Actions</span>
        </h2>

        {moderationItems.map((item) => (
          <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  item.type === 'user' ? 'bg-blue-500/20' :
                  item.type === 'post' ? 'bg-pink-500/20' :
                  'bg-purple-500/20'
                }`}>
                  {item.type === 'user' ? '👤' : item.type === 'post' ? '📝' : '💬'}
                </div>
                <div>
                  <p className="text-white font-medium">{item.target}</p>
                  <p className="text-gray-400 text-sm">{item.reason}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  item.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.severity}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.action === 'removed' ? 'bg-red-500/20 text-red-400' :
                  item.action === 'suspended' ? 'bg-orange-500/20 text-orange-400' :
                  item.action === 'warned' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-700/50 text-gray-300'
                }`}>
                  {item.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>⏳</span>
          <span>Pending Moderation Actions</span>
        </h2>

        {pendingActions.map((action) => (
          <div key={action.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  action.type === 'review_request' ? 'bg-blue-500/20' :
                  action.type === 'appeal' ? 'bg-purple-500/20' :
                  'bg-green-500/20'
                }`}>
                  {action.type === 'review_request' ? '🔍' : action.type === 'appeal' ? '📢' : '🤖'}
                </div>
                <div>
                  <p className="text-white font-medium capitalize">{action.type.replace('_', ' ')}</p>
                  <p className="text-gray-400 text-sm">{action.content}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  action.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {action.priority}
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-xs font-medium">
                    Review
                  </button>
                  <button className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-xs font-medium">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">🛠️ Moderation Tools</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors border border-blue-500/30 text-sm font-medium">
              Ban User
            </button>
            <button className="w-full px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-colors border border-purple-500/30 text-sm font-medium">
              Remove Post
            </button>
            <button className="w-full px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-colors border border-orange-500/30 text-sm font-medium">
              Send Warning
            </button>
            <button className="w-full px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-colors border border-green-500/30 text-sm font-medium">
              Approve Content
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">📊 Moderation Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Actions This Week</span>
              <span className="text-white font-bold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Warned</span>
              <span className="text-yellow-400 font-bold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Users Banned</span>
              <span className="text-red-400 font-bold">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Posts Removed</span>
              <span className="text-orange-400 font-bold">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminModeration;
