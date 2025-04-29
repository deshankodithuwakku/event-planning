/**
 * Helper function to ensure image URLs are properly formatted
 * @param {string} url - The URL to process
 * @returns {string} - A properly formatted URL
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, prefix with backend URL
  return `http://localhost:5555${url.startsWith('/') ? '' : '/'}${url}`;
};
