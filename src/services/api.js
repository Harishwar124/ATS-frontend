import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
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
