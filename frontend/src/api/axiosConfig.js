import axios from 'axios';

const api = axios.create({
  // baseURL: 'https://snaptool-8xz1.onrender.com/api', // Your backend URL
  baseURL : 'http://localhost:5001/api'
});

api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;