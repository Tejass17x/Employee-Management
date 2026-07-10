import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor to dynamically inject X-User-Id and X-User-Role headers
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) {
        config.headers['X-User-Id'] = user.id;
        config.headers['X-User-Role'] = user.role;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
