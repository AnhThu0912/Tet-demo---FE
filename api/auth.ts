import { API_BASE_URL } from "../config/env";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as { message?: string })?.message ??
      (json as ApiResponse<unknown>)?.message ??
      "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
    throw new Error(message);
  }

  const data =
    (json as ApiResponse<LoginResponse>)?.data ??
    (json as any)?.data ??
    json;

  if (!data || typeof data.token !== "string" || !data.user) {
    throw new Error("Phản hồi đăng nhập không hợp lệ từ máy chủ.");
  }

  return data as LoginResponse;
};

