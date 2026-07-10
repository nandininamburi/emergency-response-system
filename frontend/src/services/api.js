import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Emergency API
export const emergencyApi = {
  createCitizen: async (data) => {
    const response = await api.post('/emergencies/citizen', data);
    return response.data;
  },
  createDispatcher: async (data) => {
    const response = await api.post('/emergencies/dispatcher', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/emergencies');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/emergencies/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/emergencies/${id}`, data);
    return response.data;
  },
  assignOfficer: async (id, officerData) => {
    const response = await api.post(`/emergencies/${id}/assign`, officerData);
    return response.data;
  },
  getByStatus: async (status) => {
    const response = await api.get(`/emergencies/status/${status}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/emergencies/${id}`);
    return response.data;
  }
};

// AI API
export const aiApi = {
  classify: async (description) => {
    const response = await api.post('/ai/classify', { description });
    return response.data;
  },
  suggest: async (query) => {
    const response = await api.post('/ai/suggest', { query });
    return response.data;
  }
};

export default api;