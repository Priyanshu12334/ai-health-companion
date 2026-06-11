import axios from 'axios';

// Use env variable, with a fallback to production URL if env is missing
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-health-companion-qxyl.onrender.com/api';

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
