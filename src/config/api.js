const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-api.com' // Replace with your production API URL
    : 'http://localhost:3000';

export const ENDPOINTS = {
  BLUESKY: {
    CONNECT: `${API_BASE_URL}/api/bluesky/connect`,
    POST: `${API_BASE_URL}/api/bluesky/post`,
  },
};

export default API_BASE_URL;
