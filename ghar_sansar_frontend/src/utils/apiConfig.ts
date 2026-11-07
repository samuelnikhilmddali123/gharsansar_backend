// Central API Configuration
// Defaults to local /api (proxied by Vite to localhost:5001) to prevent CORS issues
export const API_BASE = import.meta.env.VITE_AWS_API_URL || "/api";
export const BACKEND_URL = API_BASE;
export const BACKEND_STATIC_URL = API_BASE.startsWith("http")
  ? API_BASE.replace(/\/api$/, "")
  : "";
