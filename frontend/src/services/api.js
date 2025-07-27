import axios from "axios";

// Use environment variable for API URL, fallback to local development
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get("/health");
    return response.data;
  },

  // Get form options from dataset
  async getFormOptions() {
    const response = await api.get("/form-options");
    return response.data;
  },

  // Get model info
  async getModelInfo() {
    const response = await api.get("/model-info");
    return response.data;
  },

  // Predict with linear regression
  async predictLinear(data) {
    const response = await api.post("/predict/linear", data);
    return response.data;
  },

  // Predict with both models
  async predictBoth(data) {
    const response = await api.post("/predict/both", data);
    return response.data;
  },
};

export default apiService;
