import api from './axiosConfig';

// Emergency API calls
export const emergencyApi = {
  // Create emergency report
  create: async (data) => {
    const response = await api.post('/emergencies', data);
    return response.data;
  },
  
  // Get all emergencies
  getAll: async () => {
    const response = await api.get('/emergencies');
    return response.data;
  },
  
  // Get emergency by ID
  getById: async (id) => {
    const response = await api.get(`/emergencies/${id}`);
    return response.data;
  },
  
  // Update emergency
  update: async (id, data) => {
    const response = await api.put(`/emergencies/${id}`, data);
    return response.data;
  },
  
  // Assign officer
  assignOfficer: async (id, officerData) => {
    const response = await api.post(`/emergencies/${id}/assign`, officerData);
    return response.data;
  },
  
  // Get emergencies by status
  getByStatus: async (status) => {
    const response = await api.get(`/emergencies/status/${status}`);
    return response.data;
  },
  
  // Delete emergency
  delete: async (id) => {
    const response = await api.delete(`/emergencies/${id}`);
    return response.data;
  }
};

// AI API calls
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

// Auth API calls
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