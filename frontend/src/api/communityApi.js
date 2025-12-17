import axiosInstance from './axiosInstance';

// Get all communities
export const getAllCommunities = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await axiosInstance.get('/communities', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get community by ID
export const getCommunityById = async (communityId) => {
  try {
    const response = await axiosInstance.get(`/communities/${communityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create community
export const createCommunity = async (communityData) => {
  try {
    const response = await axiosInstance.post('/communities', communityData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update community
export const updateCommunity = async (communityId, communityData) => {
  try {
    const response = await axiosInstance.put(`/communities/${communityId}`, communityData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete community
export const deleteCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.delete(`/communities/${communityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Join community
export const joinCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.post(`/auth/community/${communityId}/join`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Leave community
export const leaveCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.post(`/auth/community/${communityId}/leave`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user communities
export const getUserCommunities = async () => {
  try {
    const response = await axiosInstance.get('/auth/user-communities');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get community members
export const getCommunityMembers = async (communityId, page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/communities/${communityId}/members`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check membership status
export const checkMembership = async (communityId) => {
  try {
    const response = await axiosInstance.get(`/communities/${communityId}/check-membership`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Get community posts
export const getCommunityPosts = async (communityId, page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get('/posts', {
      params: { communityId, page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};