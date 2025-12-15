import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor - her istek öncesi token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token expire ise refresh token kullan
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expire ediyse (401) ve daha retry yapılmadıysa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Refresh token yoksa logout yap ve login sayfasına yönlendir
          handleLogout();
          return Promise.reject(error);
        }

        // Refresh token ile yeni access token al
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          token: refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;

        // Yeni token'ı localStorage'e kaydet
        localStorage.setItem('accessToken', newAccessToken);

        // Original request'i yeni token ile tekrarla
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh başarısızsa logout yap ve login sayfasına yönlendir
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Logout fonksiyonu - token expire olunca çağrılır
function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
  
  // Login sayfasına yönlendir
  window.location.href = '/login';
}

export default axiosInstance;
