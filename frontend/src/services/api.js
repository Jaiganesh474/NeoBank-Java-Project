import axios from 'axios';

const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    let base = envUrl.trim().replace(/\/+$/, '');
    if (!base.endsWith('/api')) {
      base = `${base}/api`;
    }
    const finalUrl = `${base}/`;
    console.log("API: Initializing with Base URL:", finalUrl);
    return finalUrl;
  }

  if (import.meta.env.PROD) {
    return '/api/';
  }

  return 'http://localhost:8080/api/';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Priority alert
        const { toast } = await import('react-toastify');
        toast.warn("Session expired. Please login again.", { toastId: 'session-expired' });
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
