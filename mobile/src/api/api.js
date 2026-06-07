import axios from 'axios';
import { Platform } from 'react-native';

// Platform'a göre doğru API adresi seçilir
// Canlı sunucu (Render.com) kullanılıyor
const getApiUrl = () => {
  return 'https://driver-ops.onrender.com/api'; // Tüm platformlar için canlı API
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
