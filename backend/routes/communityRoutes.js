const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createCommunity,
  getAllCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
  checkMembership
} = require("../controllers/communityController");

// Public routes
router.get("/", getAllCommunities);
router.get("/:communityId", getCommunityById);
router.get("/:communityId/members", getCommunityMembers);

// Protected routes
router.post("/", verifyToken, createCommunity);
router.put("/:communityId", verifyToken, updateCommunity);
router.delete("/:communityId", verifyToken, deleteCommunity);
router.get("/:communityId/check-membership", verifyToken, checkMembership);

module.exports = router;
