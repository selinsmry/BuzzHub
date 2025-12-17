const { Community, User, Post } = require("../models");

// CREATE COMMUNITY
exports.createCommunity = async (req, res) => {
  try {
    const { name, description, rules, is_private, icon } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: "Community name is required" });
    }

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
      return res.status(400).json({ error: "Community already exists" });
    }

    const community = new Community({
      name,
      description,
      owner_id: userId,
      rules: rules || [],
      is_private: is_private || false,
      icon,
      members: [userId],
      member_count: 1
    });

    await community.save();

    // Add community to owner's communities
    const user = await User.findById(userId);
    user.communities.push(community._id);
    await user.save();

    res.status(201).json({ 
      message: "Community created successfully",
      community 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create community" });
  }
};

// GET ALL COMMUNITIES
exports.getAllCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const communities = await Community.find(query)
      .populate('owner_id', 'username profile_picture')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Community.countDocuments(query);

    res.json({
      communities,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch communities" });
  }
};

// GET COMMUNITY BY ID
exports.getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId)
      .populate('owner_id', 'username profile_picture')
      .populate('members', 'username profile_picture');

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.json({ community });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community" });
  }
};

// UPDATE COMMUNITY (only owner)
exports.updateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { description, rules, is_private, icon } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if user is owner
    if (community.owner_id.toString() !== userId) {
      return res.status(403).json({ error: "Only community owner can update" });
    }

    // Update fields
    if (description) community.description = description;
    if (rules) community.rules = rules;
    if (is_private !== undefined) community.is_private = is_private;
    if (icon) community.icon = icon;

    await community.save();

    res.json({ 
      message: "Community updated successfully",
      community 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update community" });
  }
};

// DELETE COMMUNITY (only owner)
exports.deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Check if user is owner
    if (community.owner_id.toString() !== userId) {
      return res.status(403).json({ error: "Only community owner can delete" });
    }

    // Remove community from all users
    await User.updateMany(
      { communities: communityId },
      { $pull: { communities: communityId } }
    );

    // Delete all posts in community
    await Post.deleteMany({ communityId });

    // Delete community
    await Community.findByIdAndDelete(communityId);

    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete community" });
  }
};

// GET COMMUNITY MEMBERS
exports.getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const community = await Community.findById(communityId)
      .populate({
        path: 'members',
        select: 'username profile_picture karma_points',
        options: {
          limit: parseInt(limit),
          skip: (page - 1) * parseInt(limit)
        }
      });

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.json({
      members: community.members,
      total: community.member_count,
      page: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community members" });
  }
};

// CHECK IF USER IS MEMBER
exports.checkMembership = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isMember = community.members.includes(userId);
    const isOwner = community.owner_id.toString() === userId;

    res.json({
      isMember,
      isOwner,
      memberCount: community.member_count
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to check membership" });
  }
};
