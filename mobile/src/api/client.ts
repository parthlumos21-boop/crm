import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../storage/authStorage';

// For local testing on a physical device, EXPO_PUBLIC_API_URL should be your machine's LAN IP
// E.g. http://192.168.1.100:5000/api
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token and log
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s, token refresh, and log
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    console.log(`[API Error] ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'} - Status: ${error.response?.status || 'Network Error'}`);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
            clientType: 'mobile',
          });

          if (res.data?.success && res.data?.tokens) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.tokens;
            await saveTokens(accessToken, newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          await clearTokens();
          // Optionally dispatch a global event to redirect to login
          return Promise.reject(refreshError);
        }
      } else {
        await clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
