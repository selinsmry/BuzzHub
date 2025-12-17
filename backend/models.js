const mongoose = require('mongoose');

// Post Schema
const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    subreddit: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    votes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    image: String,
    createdAt: { type: Date, default: Date.now },
    communities: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: false },
    status: { type: String, enum: ['published', 'flagged', 'deleted'], default: 'published' },
    is_locked: { type: Boolean, default: false },
    is_pinned: { type: Boolean, default: false },
    reported_count: { type: Number, default: 0 },
    // Track individual votes per user
    userVotes: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      voteType: { type: String, enum: ['up', 'down'] }
    }]
  },
  { timestamps: true }
);

// Community Schema 
const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    description: String,
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    rules: [String],
    is_private: { type: Boolean, default: false },
    member_count: { type: Number, default: 0 },
    icon: String,
    post_count: {type: Number, default: 0},
  },
  { timestamps: true }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile_picture: String,
    bio: String,
    karma_points: { type: Number, default: 0 },
    is_suspended: { type: Boolean, default: false },
    suspension_reason: String,
    suspension_until: Date,
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


const commentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    votes: { type: Number, default: 0 },
    image: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['follow', 'comment', 'post', 'mention'], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = {
  Post: mongoose.model('Post', postSchema),
  Community: mongoose.model('Community', communitySchema),
  User: mongoose.model('User', userSchema),
  Comment: mongoose.model('Comment', commentSchema),
  Notification: mongoose.model('Notification', notificationSchema)
};
