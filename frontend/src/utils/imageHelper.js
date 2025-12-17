/**
 * Get the full image URL for uploads
 * Handles both relative paths and absolute URLs
 * @param {string} imagePath - The image path from API (e.g., '/uploads/file.jpg' or full URL)
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API server URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remove /api to get base URL
  
  return `${baseUrl}${imagePath}`;
};
