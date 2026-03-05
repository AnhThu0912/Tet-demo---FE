/**
 * Base URL cho API (có /api ở cuối).
 * Dev: http://localhost:3001/api
 * Production: set VITE_API_BASE_URL trên Vercel = https://tet-demo-be-production.up.railway.app/api
 */
const _env = (import.meta as unknown as { env: Record<string, string> }).env;
export const API_BASE_URL =
  _env?.VITE_API_BASE_URL || "http://localhost:3001/api";

/**
 * Origin backend (không có /api), dùng cho resolve ảnh sản phẩm.
 */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "") || "http://localhost:3001";
