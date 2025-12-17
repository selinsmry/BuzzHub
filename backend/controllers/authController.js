const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Community } = require("../models");

function generateAccessToken(user){
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m"}
    );
}

function generateRefreshToken(user){
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "5h"}
    );
}

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Şifre en az 6 karakter olmalı
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
        }

        const hashed = await bcrypt.hash(password, 6);

        const newUser = await User.create({
            username,
            email,
            password: hashed
        });

        res.json({ message: "User created successfully." });

    } catch(error) {
        res.status(500).json({ error: "Registration failed." });

    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Şifre en az 6 karakter olmalı
        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır" });
        }

        const user = await User.findOne({ username });
        if(!user) return res.status(404).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ error: "Incorrect password" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            user: { id: user._id, username: user.username, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ error: "Login failed." });
    }
};

// REFRESH
exports.refresh = (req, res) => {
    const { token } = req.body;

    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken });

    } catch (error) {
        res.status(403).json({ error: "Invalid refresh token" });
    }

};

// LOGOUT
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

// CHANGE USER ROLE
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: "User ID and role are required" });
    }

    const validRoles = ['user', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to change user role" });
  }
};

// JOIN COMMUNITY
exports.joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    console.log(`[JOIN] User ${userId} attempting to join community ${communityId}`);

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      console.log(`[JOIN] Community not found: ${communityId}`);
      return res.status(404).json({ error: "Community not found" });
    }

    // Initialize members array if it doesn't exist
    if (!community.members) {
      console.log(`[JOIN] Initializing members array`);
      community.members = [];
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      console.log(`[JOIN] User already member: ${userId}`);
      return res.status(400).json({ error: "User is already a member of this community" });
    }

    // Add user to community members
    community.members.push(userId);
    community.member_count = community.members.length;
    await community.save();
    console.log(`[JOIN] Added to community members. New count: ${community.member_count}`);

    // Add community to user's communities
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[JOIN] User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.communities) {
      user.communities = [];
      console.log(`[JOIN] Initialized user communities array`);
    }

    if (!user.communities.includes(communityId)) {
      user.communities.push(communityId);
      await user.save();
      console.log(`[JOIN] Added to user communities. New count: ${user.communities.length}`);
    }

    res.json({ 
      message: "Successfully joined community",
      community: {
        id: community._id,
        name: community.name,
        member_count: community.member_count
      }
    });
  } catch (error) {
    console.error("[JOIN ERROR]", error);
    res.status(500).json({ error: "Failed to join community", details: error.message });
  }
};

// LEAVE COMMUNITY
exports.leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    console.log(`[LEAVE] User ${userId} attempting to leave community ${communityId}`);

    // Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      console.log(`[LEAVE] Community not found: ${communityId}`);
      return res.status(404).json({ error: "Community not found" });
    }

    // Initialize members array if it doesn't exist
    if (!community.members) {
      community.members = [];
      console.log(`[LEAVE] Initialized members array`);
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      console.log(`[LEAVE] User not a member: ${userId}`);
      return res.status(400).json({ error: "User is not a member of this community" });
    }

    // Prevent owner from leaving (only if owner_id exists)
    if (community.owner_id && community.owner_id.toString() === userId) {
      console.log(`[LEAVE] Owner cannot leave: ${userId}`);
      return res.status(400).json({ error: "Community owner cannot leave" });
    }

    // Remove user from community members
    community.members = community.members.filter(id => id.toString() !== userId);
    community.member_count = community.members.length;
    await community.save();
    console.log(`[LEAVE] Removed from community. New count: ${community.member_count}`);

    // Remove community from user's communities
    const user = await User.findById(userId);
    if (user && user.communities) {
      user.communities = user.communities.filter(id => id.toString() !== communityId);
      await user.save();
      console.log(`[LEAVE] Removed from user communities`);
    }

    res.json({ 
      message: "Successfully left community",
      community: {
        id: community._id,
        name: community.name,
        member_count: community.member_count
      }
    });
  } catch (error) {
    console.error("[LEAVE ERROR]", error);
    res.status(500).json({ error: "Failed to leave community", details: error.message });
  }
};

// GET USER COMMUNITIES
exports.getUserCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[GET COMMUNITIES] Fetching communities for user: ${userId}`);

    const user = await User.findById(userId).populate('communities');
    if (!user) {
      console.log(`[GET COMMUNITIES] User not found: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[GET COMMUNITIES] Found ${user.communities?.length || 0} communities for user`);

    res.json({ 
      message: "User communities retrieved",
      communities: user.communities || []
    });
  } catch (error) {
    console.error("[GET COMMUNITIES ERROR]", error);
    res.status(500).json({ error: "Failed to get user communities", details: error.message });
  }
};


