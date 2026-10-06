import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s request timeout for mobile resilience
  headers: {
    'Content-Type': 'application/json',
  },
});

let sessionExpiryHandler: (() => void) | null = null;

export const setSessionExpiryHandler = (handler: () => void) => {
  sessionExpiryHandler = handler;
};

// Request interceptor: Attach JWT token stored ONLY in SecureStore
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Failed reading token from SecureStore:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: On 401, clear SecureStore and invoke session expiry handler
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_data');
      } catch (err) {
        console.warn('Failed deleting token from SecureStore:', err);
      }
      if (sessionExpiryHandler) {
        sessionExpiryHandler();
      }
    }
    return Promise.reject(error);
  }
);
