import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ss_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize errors so every catch block can rely on a friendly, human
// readable error.response.data.message — network failures and unexpected
// server errors don't come with one by default.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.response = { data: {} };
      error.response.data.message =
        "Network error. Please check your connection and try again.";
    } else if (error.response.status >= 500 && !error.response.data?.message) {
      error.response.data = {
        ...error.response.data,
        message: "Server error. Please try again in a moment.",
      };
    }

    return Promise.reject(error);
  }
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default api;
