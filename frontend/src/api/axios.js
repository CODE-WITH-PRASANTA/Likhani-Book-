import axios from "axios";

export const BASE_URL = "http://localhost:5000";

export const IMG_URL = BASE_URL;

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lekhani_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;