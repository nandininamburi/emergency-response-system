// Emergency types
export const EMERGENCY_TYPES = {
  ACCIDENT: 'Accident',
  FIRE: 'Fire',
  CRIME: 'Crime',
  MEDICAL: 'Medical',
  OTHER: 'Other'
};

// Emergency statuses
export const EMERGENCY_STATUS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  ON_ROUTE: 'On Route',
  RESOLVED: 'Resolved'
};

// Status colors
export const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Assigned': 'bg-blue-100 text-blue-800',
  'On Route': 'bg-purple-100 text-purple-800',
  'Resolved': 'bg-green-100 text-green-800'
};

// Emergency icons
export const EMERGENCY_ICONS = {
  'Accident': '🚗',
  'Fire': '🔥',
  'Crime': '🚨',
  'Medical': '🩺',
  'Other': '📌'
};

// API endpoints
export const API_ENDPOINTS = {
  EMERGENCIES: '/emergencies',
  AI_CLASSIFY: '/ai/classify',
  AI_SUGGEST: '/ai/suggest',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/profile'
};

// Default location (Bengaluru)
export const DEFAULT_LOCATION = {
  latitude: 12.9716,
  longitude: 77.5946
};

// Map settings
export const MAP_SETTINGS = {
  zoom: 14,
  center: [12.9716, 77.5946],
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};