import { Product } from "../types";

import { API_BASE_URL } from "../config/env";

// Persist a cart token in browser so the same cart can be reused after refresh/reopen
const CART_TOKEN_KEY = "coffee_shop_cart_token";

const getOrCreateCartToken = (): string => {
  // In SSR/build-time contexts, window/localStorage may be undefined
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(CART_TOKEN_KEY);
  if (existing) return existing;

  // Simple UUID-ish token (good enough for demo). You can replace with crypto.randomUUID() if you prefer.
  const token = `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(CART_TOKEN_KEY, token);
  return token;
};

const withCartTokenHeaders = (
  headers: Record<string, string> = {},
): Record<string, string> => {
  const token = getOrCreateCartToken();
  return token ? { ...headers, "X-Cart-Token": token } : headers;
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface CartSummary {
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
}

/**
 * Lấy thông tin giỏ hàng
 */
export const getCart = async (): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      cache: "no-store",
      headers: withCartTokenHeaders({
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;

    if (cartData && typeof cartData === "object" && "items" in cartData) {
      return cartData as CartData;
    } else {
      throw new Error("Unexpected cart response shape");
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

/**
 * Thêm/Update sản phẩm vào giỏ hàng
 */
export const addToCart = async (
  productId: number,
  quantity: number,
): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: withCartTokenHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;

    if (cartData && typeof cartData === "object" && "items" in cartData) {
      return cartData as CartData;
    } else {
      throw new Error("Unexpected cart response shape");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateCartItem = async (
  productId: number,
  quantity: number,
): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
      method: "PATCH",
      headers: withCartTokenHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
      body: JSON.stringify({
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;

    if (cartData && typeof cartData === "object" && "items" in cartData) {
      return cartData as CartData;
    } else {
      throw new Error("Unexpected cart response shape");
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeCartItem = async (productId: number): Promise<CartData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
      method: "DELETE",
      headers: withCartTokenHeaders({
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const cartData: unknown = (json as ApiResponse<CartData>)?.data ?? json;

    if (cartData && typeof cartData === "object" && "items" in cartData) {
      return cartData as CartData;
    } else {
      throw new Error("Unexpected cart response shape");
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};
