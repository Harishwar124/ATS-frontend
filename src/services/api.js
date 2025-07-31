import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend-ats-xspw.onrender.com/api";

console.log('🔧 API Configuration Debug:');
console.log('  Environment:', import.meta.env.MODE);
console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  Hostname:', window.location.hostname);
console.log('  Final API_BASE_URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request Debug:');
    console.log('  Method:', config.method?.toUpperCase());
    console.log('  URL:', config.url);
    console.log('  Full URL:', config.baseURL + config.url);
    console.log('  Headers:', config.headers);
    console.log('  Data:', config.data);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('  Auth Token:', token.substring(0, 20) + '...');
    } else {
      console.log('  No auth token found');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Debug:');
    console.log('  Status:', response.status);
    console.log('  URL:', response.config.url);
    console.log('  Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error Debug:');
    console.error('  Error:', error);
    console.error('  Status:', error.response?.status);
    console.error('  Status Text:', error.response?.statusText);
    console.error('  URL:', error.config?.url);
    console.error('  Full URL:', error.config?.baseURL + error.config?.url);
    console.error('  Response Data:', error.response?.data);
    console.error('  Response Headers:', error.response?.headers);
    console.error('  Request Headers:', error.config?.headers);
    console.error('  Network Error:', error.code);
    console.error('  Message:', error.message);
    return Promise.reject(error);
  }
);

// Applicant API methods
export const applicantAPI = {
  // Get all applicants
  getAll: async () => {
    const response = await api.get("/applicants");
    return response.data;
  },

  // Get single applicant
  getById: async (id) => {
    const response = await api.get(`/applicants/${id}`);
    return response.data;
  },

  // Create new applicant
  create: async (applicantData) => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(applicantData).forEach((key) => {
      if (applicantData[key] !== null && applicantData[key] !== undefined) {
        if (key === "resume" && applicantData[key] instanceof File) {
          formData.append("resume", applicantData[key]);
        } else {
          formData.append(key, applicantData[key]);
        }
      }
    });

    const response = await api.post("/applicants", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update applicant
  update: async (id, applicantData) => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(applicantData).forEach((key) => {
      if (applicantData[key] !== null && applicantData[key] !== undefined) {
        if (key === "resume" && applicantData[key] instanceof File) {
          formData.append("resume", applicantData[key]);
        } else {
          formData.append(key, applicantData[key]);
        }
      }
    });

    const response = await api.put(`/applicants/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete applicant (admin only)
  delete: async (id, adminPassword) => {
    const response = await api.delete(`/applicants/${id}`, {
      data: { adminPassword },
    });
    return response.data;
  },

  // Export to Excel
  exportToExcel: async (filters) => {
    const response = await api.get("/applicants/export", {
      responseType: "blob",
      params: filters
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applicants_export_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, message: "Export completed successfully" };
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;

