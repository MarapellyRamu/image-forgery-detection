/**
 * Axios API client for the Image Forgery Detection backend.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL (defaults to http://localhost:8000).
 * All authenticated requests attach the JWT Bearer token from localStorage.
 * On 401 the client clears credentials and redirects to /auth/login.
 */

import axios from "axios";

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// ── Request interceptor: inject JWT ───────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("forgery_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("forgery_token");
        localStorage.removeItem("forgery_user");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────────────────
export const authApi = {
  /**
   * Login — backend expects OAuth2 form data (username + password).
   * We convert the email/username field to 'username' as required by FastAPI.
   */
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    return api.post("/api/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),

  getMe: () => api.get("/api/auth/me"),

  logout: () => api.post("/api/auth/logout"),
};

// ── Image / prediction endpoints ──────────────────────────────────────────
export const imagesApi = {
  /**
   * Upload an image file for forgery detection.
   * @param formData  FormData with key "file".
   * @param onUploadProgress  Optional Axios progress callback.
   */
  uploadImage: (
    formData: FormData,
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ) =>
    api.post("/api/images/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),

  /**
   * Paginated detection history for the current user.
   * @param page   1-indexed page number.
   * @param limit  Items per page.
   * @param search Optional filename search string.
   * @param filterResult  'authentic' | 'forged' | undefined
   */
  getHistory: (
    page = 1,
    limit = 10,
    search?: string,
    filterResult?: string
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append("search", search);
    if (filterResult) params.append("filter_result", filterResult);
    return api.get(`/api/images/history?${params.toString()}`);
  },

  /** Delete a prediction record (and associated files) by ID. */
  deletePrediction: (id: number) =>
    api.delete(`/api/images/history/${id}`),

  /** Download the PDF detection report for a prediction. */
  downloadReport: (id: number) =>
    api.get(`/api/images/download-report/${id}`, { responseType: "blob" }),

  /** Fetch the GradCAM overlay image for a prediction (returns image blob). */
  getGradcam: (id: number) =>
    api.get(`/api/images/gradcam/${id}`, { responseType: "blob" }),

  /**
   * Build the direct URL to the uploaded original image.
   * Served as a static file from the backend.
   */
  getImageUrl: (imagePath: string) => {
    const filename = imagePath.split(/[\\/]/).pop();
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/uploads/${filename}`;
  },

  /**
   * Build the direct URL to the GradCAM endpoint for an <img> src.
   * Requires the Authorization header — use getGradcam() for blob downloads,
   * or use this in an authenticated <img> via a data-url pattern.
   */
  getGradcamUrl: (id: number) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/images/gradcam/${id}`,
};

// ── Admin endpoints ───────────────────────────────────────────────────────
export const adminApi = {
  /** List all registered users. */
  getUsers: () => api.get("/api/admin/users"),

  /** Delete a user by ID. */
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),

  /** List all predictions across all users. */
  getAllPredictions: () => api.get("/api/admin/predictions"),

  /** Admin delete any prediction by ID. */
  deleteAdminPrediction: (id: number) =>
    api.delete(`/api/admin/predictions/${id}`),

  /** Fetch analytics stats: totals, daily chart data, etc. */
  getAnalytics: () => api.get("/api/admin/analytics"),
};

export default api;
