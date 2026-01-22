// API Configuration
// Change this URL when deploying to production

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://104.234.26.192:3000';

// Helper function to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};
