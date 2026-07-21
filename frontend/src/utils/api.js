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
  const user = JSON.parse(localStorage.getItem('welloraUser'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  config.headers['X-Timezone-Offset'] = new Date().getTimezoneOffset();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response && 
      error.response.status === 401 && 
      !error.config.url.includes('/auth/login')
    ) {
      // Token expired or invalid, log out user
      localStorage.removeItem('welloraUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
