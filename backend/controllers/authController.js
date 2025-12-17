const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, Community, Notification } = require("../models");

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

        // Ban kontrolü
        if (user.is_suspended) {
            return res.status(403).json({ 
                error: "Bu hesap yönetim tarafından yasaklanmıştır",
                suspended: true,
                reason: user.suspension_reason || "Yasaklama nedeni belirtilmemiştir"
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ error: "Incorrect password" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            accessToken,
            refreshToken,
            user: { _id: user._id, id: user._id, username: user.username, role: user.role }
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

// UPDATE USER PROFILE
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, profile_picture, username } = req.body;

    // Validate input
    if (!bio && !profile_picture && !username) {
      return res.status(400).json({ error: "En az bir alan güncellenmelidir" });
    }

    // Update user
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;
    
    // Username güncellemesi - duplicate check
    if (username !== undefined && username.trim() !== '') {
      // Mevcut kullanıcı adını kontrol et
      const currentUser = await User.findById(userId);
      
      // Yeni kullanıcı adı ile eski aynı değilse ve başka biri kullanıyorsa hata ver
      if (username !== currentUser.username) {
        const existingUser = await User.findOne({ username: username.trim() });
        if (existingUser) {
          return res.status(400).json({ error: "Bu kullanıcı adı zaten kullanılmakta" });
        }
      }
      
      updateData.username = username.trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ 
      message: "Profil başarıyla güncellendi",
      user 
    });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error);
    res.status(500).json({ error: "Profil güncellenemedi", details: error.message });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("[GET USER ERROR]", error);
    res.status(500).json({ error: "Failed to get user", details: error.message });
  }
};

// FOLLOW USER
exports.followUser = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const currentUserId = req.user.id;

    if (currentUserId === userIdToFollow) {
      return res.status(400).json({ error: "Kendinizi takip edemezsiniz" });
    }

    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userIdToFollow);

    if (!userToFollow) {
      return res.status(404).json({ error: "Takip edilecek kullanıcı bulunamadı" });
    }

    // Zaten takip edip etmediğini kontrol et
    if (currentUser.following.includes(userIdToFollow)) {
      return res.status(400).json({ error: "Zaten bu kullanıcıyı takip ediyorsunuz" });
    }

    // Following ve followers listelerine ekle
    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    // Bildirim oluştur
    const notification = await Notification.create({
      recipientId: userIdToFollow,
      senderId: currentUserId,
      type: 'follow',
      message: `${currentUser.username} sizi takip etmeye başladı`,
      link: `/profile/${currentUserId}`
    });

    res.json({ 
      message: "Başarıyla takip ettiniz", 
      notification: notification 
    });
  } catch (error) {
    console.error("[FOLLOW USER ERROR]", error);
    res.status(500).json({ error: "Takip işlemi başarısız oldu", details: error.message });
  }
};

// UNFOLLOW USER
exports.unfollowUser = async (req, res) => {
  try {
    const { userIdToUnfollow } = req.body;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userIdToUnfollow);

    if (!userToUnfollow) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    // Following ve followers listesinden kaldır
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userIdToUnfollow
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Başarıyla takip etmeyi bıraktınız" });
  } catch (error) {
    console.error("[UNFOLLOW USER ERROR]", error);
    res.status(500).json({ error: "Takip etmeyi bırakma işlemi başarısız", details: error.message });
  }
};

// GET FOLLOWERS
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('followers', '-password');

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({ followers: user.followers });
  } catch (error) {
    console.error("[GET FOLLOWERS ERROR]", error);
    res.status(500).json({ error: "Takipçiler getirilemedi", details: error.message });
  }
};

// GET FOLLOWING
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('following', '-password');

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    res.json({ following: user.following });
  } catch (error) {
    console.error("[GET FOLLOWING ERROR]", error);
    res.status(500).json({ error: "Takip edilen kullanıcılar getirilemedi", details: error.message });
  }
};

// CHECK IF FOLLOWING
exports.isFollowing = async (req, res) => {
  try {
    const { userId, targetUserId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const isFollowing = user.following.some(id => id.toString() === targetUserId);
    res.json({ isFollowing });
  } catch (error) {
    console.error("[CHECK FOLLOWING ERROR]", error);
    res.status(500).json({ error: "Kontrol işlemi başarısız", details: error.message });
  }
};

// GET NOTIFICATIONS
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'username profile_picture')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (error) {
    console.error("[GET NOTIFICATIONS ERROR]", error);
    res.status(500).json({ error: "Bildirimler getirilemedi", details: error.message });
  }
};

// MARK NOTIFICATION AS READ
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    res.json({ notification });
  } catch (error) {
    console.error("[MARK NOTIFICATION ERROR]", error);
    res.status(500).json({ error: "Bildirim güncellenemedi", details: error.message });
  }
};


