const { User, Community, Post } = require('../models');

// Get recommended communities for a user
const getRecommendedCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('communities')
      .populate('communityEngagement.communityId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all communities
    const allCommunities = await Community.find().populate('members');

    // Get user's current communities (to exclude from recommendations)
    const userCommunityIds = user.communities.map(c => c._id.toString());

    // Calculate recommendation scores
    const scoredCommunities = allCommunities
      .filter(c => !userCommunityIds.includes(c._id.toString()))
      .map(community => ({
        ...community.toObject(),
        recommendationScore: calculateRecommendationScore(user, community, allCommunities)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10); // Top 10 recommendations

    res.status(200).json({
      message: 'Recommended communities',
      data: scoredCommunities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate recommendation score for a community
const calculateRecommendationScore = (user, community, allCommunities) => {
  let score = 0;

  // 1. Similar members score (Collaborative Filtering)
  const userCommunityMembers = new Set(
    user.communities.flatMap(c => 
      c.members ? c.members.map(m => m.toString()) : []
    )
  );

  const communityMembers = community.members || [];
  const sharedMembers = communityMembers.filter(m =>
    userCommunityMembers.has(m.toString())
  ).length;

  const similarityScore = (sharedMembers / Math.max(communityMembers.length, 1)) * 30;
  score += similarityScore;

  // 2. Engagement based on liked communities
  if (user.communityEngagement && user.communityEngagement.length > 0) {
    const avgEngagement = user.communityEngagement.reduce((sum, ce) => 
      sum + (ce.engagement_score || 0), 0
    ) / user.communityEngagement.length;

    // Check if similar types of posts are posted in this community
    const userLikedPostCategories = getUserLikedPostCategories(user);
    const categoryMatch = calculateCategoryMatch(community, userLikedPostCategories);
    
    score += (categoryMatch * 25);
  }

  // 3. Community popularity
  const popularityScore = Math.min(community.member_count / 100, 20);
  score += popularityScore;

  // 4. Recent activity boost
  if (community.updatedAt) {
    const daysSinceUpdate = (Date.now() - community.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) {
      score += 15;
    }
  }

  // 5. Post count indicator (more posts = more active)
  const activityBoost = Math.min(community.post_count / 50, 10);
  score += activityBoost;

  return score;
};

// Get user's preferred post categories based on votes
const getUserLikedPostCategories = (user) => {
  if (!user.preferredCategories || user.preferredCategories.length === 0) {
    return [];
  }
  return user.preferredCategories;
};

// Calculate how well community matches user interests
const calculateCategoryMatch = (community, userCategories) => {
  if (userCategories.length === 0) return 0;
  
  // This would depend on how you categorize your communities
  // For now, using name-based matching
  const communityNameLower = community.name.toLowerCase();
  const matches = userCategories.filter(cat =>
    communityNameLower.includes(cat.toLowerCase())
  ).length;

  return (matches / userCategories.length) * 25;
};

// Track user engagement when visiting a community
const trackCommunityEngagement = async (req, res) => {
  try {
    const { communityId, timeSpent } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!communityId || timeSpent === undefined) {
      return res.status(400).json({ message: 'Missing required fields: communityId, timeSpent' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create engagement record
    const engagementIndex = user.communityEngagement.findIndex(
      ce => ce.communityId.toString() === communityId
    );

    if (engagementIndex > -1) {
      // Update existing engagement
      user.communityEngagement[engagementIndex].totalTimeSpent += timeSpent;
      user.communityEngagement[engagementIndex].visitCount += 1;
      user.communityEngagement[engagementIndex].lastVisited = new Date();
      user.communityEngagement[engagementIndex].engagement_score = 
        calculateEngagementScore(user.communityEngagement[engagementIndex]);
    } else {
      // Create new engagement record
      user.communityEngagement.push({
        communityId: communityId,
        totalTimeSpent: timeSpent,
        visitCount: 1,
        lastVisited: new Date(),
        engagement_score: calculateEngagementScore({
          totalTimeSpent: timeSpent,
          visitCount: 1
        })
      });
    }

    await user.save();

    res.status(200).json({
      message: 'Engagement tracked successfully',
      data: user.communityEngagement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate engagement score
const calculateEngagementScore = (engagement) => {
  // Scoring formula: time spent (weighted) + visit frequency
  const timeScore = Math.min(engagement.totalTimeSpent / 3600, 50); // Cap at 50 points per hour
  const visitScore = Math.min(engagement.visitCount * 5, 50); // Up to 50 points for visits
  
  return timeScore + visitScore;
};

// Update user preferences based on interactions
const updateUserPreferences = async (req, res) => {
  try {
    const { categories } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferredCategories: categories },
      { new: true }
    );

    res.status(200).json({
      message: 'User preferences updated',
      data: user.preferredCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personalized feed based on recommendations
const getPersonalizedFeed = async (req, res) => {
  try {
    console.log('=== Feed Request ===');
    console.log('req.user:', req.user);
    const userId = req.user.id;
    console.log('userId:', userId);
    
    const user = await User.findById(userId)
      .populate('communities')
      .populate('communityEngagement.communityId');

    console.log('user found:', !!user);
    if (!user) {
      console.log('User not found in database for ID:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Get posts from user's communities and recommended ones
    const userCommunityIds = user.communities.map(c => c._id);
    
    // Get engagement-based recommendations
    const recommendations = await getRecommendedCommunitiesData(user);
    const recommendedIds = recommendations.slice(0, 3).map(c => c._id);

    // Combine both sets
    const allRelevantIds = [...userCommunityIds, ...recommendedIds];

    // Fetch posts from these communities
    const posts = await Post.find({
      communities: { $in: allRelevantIds },
      status: 'published'
    })
      .populate('userId')
      .populate('communities')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: 'Personalized feed retrieved',
      data: posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get recommended communities data
const getRecommendedCommunitiesData = async (user) => {
  const allCommunities = await Community.find().populate('members');
  const userCommunityIds = user.communities.map(c => c._id.toString());

  return allCommunities
    .filter(c => !userCommunityIds.includes(c._id.toString()))
    .map(community => ({
      ...community.toObject(),
      recommendationScore: calculateRecommendationScore(user, community, allCommunities)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
};

module.exports = {
  getRecommendedCommunities,
  trackCommunityEngagement,
  updateUserPreferences,
  getPersonalizedFeed
};
