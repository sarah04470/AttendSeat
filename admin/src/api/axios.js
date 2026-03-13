import axios from "axios";

// export const baseURL = 'http://localhost:7800/v1';
export const baseURL = import.meta.env.VITE_API_URL || 'https://attendseat.onrender.com/v1';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/members/auth/me')) return Promise.reject(error);
    if (originalRequest.url?.includes('/members/auth/refresh')) return Promise.reject(error);

    const userData = sessionStorage.getItem("ud");
    if (!userData) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      return refreshTokenAndReattemptRequest(originalRequest);
    }
    return Promise.reject(error);
  }
);

async function refreshTokenAndReattemptRequest(originalRequest) {
  try {
    await axios.post(baseURL + "/members/auth/refresh", {}, { withCredentials: true });
    window.dispatchEvent(new CustomEvent('tokenRefreshed'));
    return api(originalRequest);
  } catch (error) {
    sessionStorage.removeItem("ud");
    window.dispatchEvent(new CustomEvent('authError'));
    return Promise.reject(error);
  }
}

export default api;
