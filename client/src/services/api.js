import axios from 'axios';

const liveApiUrl = 'https://weblix-theme.onrender.com/api';

const envApiUrl = import.meta.env.VITE_API_URL;

export const API_URL = envApiUrl || liveApiUrl;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weblix_token') || sessionStorage.getItem('weblix_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const assetUrl = (path) => {
  if (!path) return '';
  const base = API_URL.replace('/api', '');
  return path.startsWith('http') ? path : `${base}/${path.replaceAll('\\', '/')}`;
};
