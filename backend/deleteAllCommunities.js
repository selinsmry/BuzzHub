const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/toplulukapp';

const communitySchema = new mongoose.Schema({
  name: String,
  members: [mongoose.Schema.Types.ObjectId],
  owner_id: mongoose.Schema.Types.ObjectId,
  description: String,
  rules: [String],
  is_private: Boolean,
  member_count: Number,
  icon: String,
  createdAt: Date,
  updatedAt: Date
});

const Community = mongoose.model('Community', communitySchema);

async function deleteAllCommunities() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const result = await Community.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} communities`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error deleting communities:', error);
    process.exit(1);
  }
}

deleteAllCommunities();
