const express = require("express");
const router = express.Router();
const { register, login, refresh, logout, changeUserRole, joinCommunity, leaveCommunity, getUserCommunities } = require("../controllers/authController");
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

module.exports = router;
