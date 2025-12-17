import axiosInstance from './axiosInstance';

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/auth/profile/update', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Follow user
export const followUser = async (userIdToFollow) => {
  try {
    const response = await axiosInstance.post('/auth/follow', { userIdToFollow });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unfollow user
export const unfollowUser = async (userIdToUnfollow) => {
  try {
    const response = await axiosInstance.post('/auth/unfollow', { userIdToUnfollow });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get followers
export const getFollowers = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/followers/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get following
export const getFollowing = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/following/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if following
export const isFollowing = async (userId, targetUserId) => {
  try {
    const response = await axiosInstance.get(`/auth/is-following/${userId}/${targetUserId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get notifications
export const getNotifications = async () => {
  try {
    const response = await axiosInstance.get('/auth/notifications');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/auth/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const response = await axiosInstance.put('/auth/notifications/clear/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};
