import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const key = Config.BASE_URL;
console.log(key)

const api = axios.create({
  baseURL: key,
  headers: {
    Accept: '*/*',
    'Cache-Control': 'no-cache',
  },
});

api.interceptors.response.use(response => {
  return response;
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('@token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.log('Erro no interceptor:', error);
    return Promise.reject(error);
  },
);

export default api;
