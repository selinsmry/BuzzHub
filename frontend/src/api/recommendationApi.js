import axiosInstance from './axiosInstance';

// Get recommended communities for the user
export const getRecommendedCommunities = async () => {
  try {
    const response = await axiosInstance.get('/recommendations/communities');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Track time spent on a community
export const trackCommunityEngagement = async (communityId, timeSpent) => {
  try {
    const response = await axiosInstance.post('/recommendations/track-engagement', {
      communityId,
      timeSpent // in seconds
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user preferences/interests
export const updateUserPreferences = async (categories) => {
  try {
    const response = await axiosInstance.put('/recommendations/preferences', {
      categories
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get personalized feed based on recommendations
export const getPersonalizedFeed = async () => {
  try {
    const response = await axiosInstance.get('/recommendations/feed');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
