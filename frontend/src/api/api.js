import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export async function ensureCsrf() {
  await api.get("/auth/csrf");
}

async function csrfPost(url, data = {}) {
  await ensureCsrf();
  return api.post(url, data);
}

export const authApi = {
  login: (data) => csrfPost("/auth/login", data),
  register: (data) => csrfPost("/auth/register", data),
  verify: (data) => csrfPost("/auth/verify", data),
  resendVerification: (data) => csrfPost("/auth/resend-verification", data),
  forgotPassword: (data) => csrfPost("/auth/forgot-password", data),
  resetPassword: (data) => csrfPost("/auth/reset-password", data),
  refresh: async () => {
    await ensureCsrf();
    return api.post("/auth/refresh");
  },
  verificationStatus: (email) =>
    api.get("/auth/verification-status", {
        params: { email }
    }),
  logout: async () => {
    await ensureCsrf();
    return api.post("/auth/logout");
  },
  me: () => api.get("/auth/me"),
};

export function getApiError(error) {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const details = Object.values(data.errors).filter(Boolean).join(" · ");
    if (details) return details;
  }

  return data?.message || data?.error || error?.message || "Ocurrió un error inesperado.";
}
