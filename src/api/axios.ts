import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "@/config/env";

export const API_BASE_URL = ENV.apiBaseUrl;

const TOKEN_KEY = ENV.tokenStorageKey;

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // ngrok-hosted backends serve an interstitial HTML page without this.
    ...(ENV.ngrokSkipWarning ? { "ngrok-skip-browser-warning": "true" } : {}),
  },
  timeout: ENV.apiTimeout,
});

// --- Request interceptor: attach bearer token when present -------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: unwrap errors into readable messages --------------
export interface NormalizedError {
  status?: number;
  message: string;
  raw?: unknown;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // Auth expired -> clear token. The route guard will redirect to /login.
    if (status === 401) {
      tokenStore.clear();
    }

    const normalized: NormalizedError = {
      status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.",
      raw: error.response?.data,
    };
    return Promise.reject(normalized);
  }
);
