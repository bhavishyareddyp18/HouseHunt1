import axios from "axios";

// Helper to determine the correct base URL
const getBaseUrl = () => {
  // If explicitly configured via environment variable (e.g. in Vercel or .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // When running locally in development browser
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5001/api";
  }

  // Safe fallback for deployed production website (Render)
  return "https://househunt-rjim.onrender.com/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor: attach bearer token if present in localStorage or sessionStorage
api.interceptors.request.use(
  (config) => {
    const token =
      (typeof window !== "undefined" && localStorage.getItem("token")) ||
      (typeof window !== "undefined" && sessionStorage.getItem("token"));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: graceful handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error cleanly for debugging
    if (error.response) {
      console.warn(`API Error [${error.response.status}]:`, error.response.data?.message || error.response.statusText);
    } else if (error.request) {
      console.warn("API Network Error: Could not connect to backend server.");
    } else {
      console.warn("API Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
