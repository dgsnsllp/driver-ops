import axios from 'axios';
import { Platform } from 'react-native';

// Platform'a göre doğru API adresi seçilir
// Telefonunuzda test edebilmeniz için bilgisayarınızın yerel IP adresi (192.168.1.157) ayarlandı.
const getApiUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return 'http://192.168.1.157:5000/api'; // Mobil cihazlar (iOS ve Android) için
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
