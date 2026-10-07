import axios from "axios";

export const BASE_URL = "http://localhost:5000";

export const IMG_URL = BASE_URL;

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;