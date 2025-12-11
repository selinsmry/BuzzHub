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
  },
  { timestamps: true }
);

// Community Schema
const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    members: { type: Number, default: 0 },
    description: String,
  },
  { timestamps: true }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Vote Schema
const voteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    type: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Post: mongoose.model('Post', postSchema),
  Community: mongoose.model('Community', communitySchema),
  User: mongoose.model('User', userSchema),
  Vote: mongoose.model('Vote', voteSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
