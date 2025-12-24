const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getRecommendedCommunities,
  trackCommunityEngagement,
  updateUserPreferences,
  getPersonalizedFeed
} = require('../controllers/recommendationController');

// Get recommended communities for the logged-in user
router.get('/communities', verifyToken, getRecommendedCommunities);

// Track user engagement in a community
router.post('/track-engagement', verifyToken, trackCommunityEngagement);

// Update user preferences/interests
router.put('/preferences', verifyToken, updateUserPreferences);

// Get personalized feed based on recommendations
router.get('/feed', verifyToken, getPersonalizedFeed);

module.exports = router;
