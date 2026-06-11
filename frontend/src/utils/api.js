import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'https://ai-health-companion-w81a.onrender.com/api';

// Automatically fix the URL if the user forgot to include /api at the end in Vercel settings
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  // Remove trailing slash if present before appending /api
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('auroraUser'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
