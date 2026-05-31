import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const API_V1_BASE_URL = `${API_BASE_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("kodeye_access_token");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Coordinates 401 retries so parallel requests share one refresh-token rotation.
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("kodeye_refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("kodeye_access_token");
        localStorage.removeItem("kodeye_refresh_token");
        window.dispatchEvent(new Event("kodeye_unauthorized"));
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_V1_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token: new_refresh_token } = refreshResponse.data;
        
        localStorage.setItem("kodeye_access_token", access_token);
        localStorage.setItem("kodeye_refresh_token", new_refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("kodeye_access_token");
        localStorage.removeItem("kodeye_refresh_token");
        window.dispatchEvent(new Event("kodeye_unauthorized"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get("/api/v1/health");
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
