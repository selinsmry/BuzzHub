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

module.exports = {
  Post: mongoose.model('Post', postSchema),
  Community: mongoose.model('Community', communitySchema),
  User: mongoose.model('User', userSchema),
};
