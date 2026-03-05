export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthData {
  token: string;
  user: AuthUser;
}

const AUTH_STORAGE_KEY = "coffee_shop_auth";

export const getAuthData = (): AuthData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    const token =
      typeof (obj as { token?: string }).token === "string"
        ? (obj as { token: string }).token
        : typeof (obj as { accessToken?: string }).accessToken === "string"
          ? (obj as { accessToken: string }).accessToken
          : typeof (obj as { access_token?: string }).access_token === "string"
            ? (obj as { access_token: string }).access_token
            : null;
    if (!token || !String(token).trim()) return null;
    const user = (obj as { user?: AuthUser }).user;
    if (!user || typeof user !== "object") return null;
    return { token: String(token).trim(), user: user as AuthUser };
  } catch {
    return null;
  }
};

export const setAuthData = (data: AuthData): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
};

export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAuthToken = (): string | null => {
  const data = getAuthData();
  const t = data?.token;
  if (t == null || typeof t !== "string") return null;
  const trimmed = t.trim();
  return trimmed === "" ? null : trimmed;
};

