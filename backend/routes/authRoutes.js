const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  refresh, 
  logout, 
  changeUserRole, 
  joinCommunity, 
  leaveCommunity, 
  getUserCommunities, 
  updateUserProfile, 
  getUserById,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getNotifications,
  markNotificationAsRead,
  clearAllNotifications
} = require("../controllers/authController");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/change-role", verifyAdmin, changeUserRole);

// Community routes
router.post("/community/:communityId/join", verifyToken, joinCommunity);
router.post("/community/:communityId/leave", verifyToken, leaveCommunity);
router.get("/user-communities", verifyToken, getUserCommunities);

// User profile routes
router.get("/users/:userId", getUserById);
router.put("/profile/update", verifyToken, updateUserProfile);

// Follow routes
router.post("/follow", verifyToken, followUser);
router.post("/unfollow", verifyToken, unfollowUser);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);
router.get("/is-following/:userId/:targetUserId", isFollowing);

// Notification routes
router.get("/notifications", verifyToken, getNotifications);
router.put("/notifications/:notificationId/read", verifyToken, markNotificationAsRead);
router.put("/notifications/clear/all", verifyToken, clearAllNotifications);

module.exports = router;
