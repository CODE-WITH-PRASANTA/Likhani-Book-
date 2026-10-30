import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export const IMG_URL = BASE_URL;

/* =========================================================
   AUTH STORAGE UTILITIES
========================================================= */

export const getAdminToken = () => {
  return (
    localStorage.getItem("adminAccessToken") ||
    sessionStorage.getItem("adminAccessToken") ||
    null
  );
};

export const getAdminRefreshToken = () => {
  return (
    localStorage.getItem("adminRefreshToken") ||
    sessionStorage.getItem("adminRefreshToken") ||
    null
  );
};

export const getAdminUser = () => {
  try {
    const raw =
      localStorage.getItem("adminUser") ||
      sessionStorage.getItem("adminUser");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const setAdminAuth = ({
  accessToken,
  refreshToken,
  admin,
  rememberMe = true,
}) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  const alternateStorage = rememberMe ? sessionStorage : localStorage;

  // Clear alternate storage to avoid stale/divergent session state
  alternateStorage.removeItem("adminAccessToken");
  alternateStorage.removeItem("adminRefreshToken");
  alternateStorage.removeItem("adminUser");
  alternateStorage.removeItem("isAdminAuthenticated");

  if (accessToken) {
    storage.setItem("adminAccessToken", accessToken);
  }
  if (refreshToken) {
    storage.setItem("adminRefreshToken", refreshToken);
  }
  if (admin) {
    storage.setItem("adminUser", JSON.stringify(admin));
  }
  storage.setItem("isAdminAuthenticated", "true");
};

export const clearAdminAuth = () => {
  localStorage.removeItem("adminAccessToken");
  localStorage.removeItem("adminRefreshToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("isAdminAuthenticated");

  sessionStorage.removeItem("adminAccessToken");
  sessionStorage.removeItem("adminRefreshToken");
  sessionStorage.removeItem("adminUser");
  sessionStorage.removeItem("isAdminAuthenticated");
};

export const isAdminAuthenticated = () => {
  return !!getAdminToken() || localStorage.getItem("isAdminAuthenticated") === "true";
};

/* =========================================================
   AXIOS INSTANCE
========================================================= */

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token
API.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if original request was already login or refresh-token to avoid loops
    if (
      !originalRequest ||
      originalRequest.url?.includes("/admin/login") ||
      originalRequest.url?.includes("/admin/refresh-token") ||
      originalRequest.url?.includes("/admin/create")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getAdminRefreshToken();

      if (!refreshToken) {
        clearAdminAuth();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/admin/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        if (data.success && data.accessToken) {
          const isLocal = !!localStorage.getItem("adminRefreshToken");
          setAdminAuth({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || refreshToken,
            admin: data.admin,
            rememberMe: isLocal,
          });

          API.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          processQueue(null, data.accessToken);
          return API(originalRequest);
        } else {
          throw new Error("Failed to refresh admin access token");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAdminAuth();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
