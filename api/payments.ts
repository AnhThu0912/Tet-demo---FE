import { getAuthToken } from "../utils/auth";
import { API_BASE_URL } from "../config/env";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const withAuthHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
};

const requireAuthHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thanh toán.");
  }
  return { ...headers, Authorization: `Bearer ${token}` };
};

interface LemonCheckoutResponse {
  checkoutUrl?: string;
  checkout_url?: string;
}

/**
 * Tạo payment cho đơn hàng: POST /api/orders/:orderId/payments
 * → trả về paymentId (nếu backend cần), nhưng FE chỉ cần biết là đã tạo.
 */
export const createPayment = async (
  orderId: number,
): Promise<{ paymentId?: number }> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payments`, {
    method: "POST",
    headers: requireAuthHeaders({
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }),
    body: JSON.stringify({}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (json as { message?: string })?.message;
    if (response.status === 403) {
      throw new Error(
        msg && msg.toLowerCase() !== "forbidden"
          ? msg
          : "Bạn không có quyền thanh toán đơn này. Vui lòng đăng nhập lại bằng tài khoản đặt hàng.",
      );
    }
    throw new Error(msg ?? `HTTP ${response.status}`);
  }

  const data =
    (json as ApiResponse<{ paymentId?: number }>)?.data ??
    (json as any)?.data ??
    json;
  const paymentId = data?.paymentId ?? data?.payment_id;
  return { paymentId: typeof paymentId === "number" ? paymentId : undefined };
};

/**
 * Tạo checkout Lemon Squeezy cho đơn hàng.
 * POST /api/lemon/create-checkout
 * Header: Authorization: Bearer <token> (cùng token dùng cho /api/orders/:id/payments)
 * Body (JSON): { "orderId": <id đơn> }
 */
export const createLemonCheckout = async (
  orderId: number,
): Promise<{ checkoutUrl: string }> => {
  const response = await fetch(`${API_BASE_URL}/lemon/create-checkout`, {
    method: "POST",
    headers: requireAuthHeaders({
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }),
    body: JSON.stringify({ orderId: Number(orderId) }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (json as { message?: string })?.message ?? `HTTP ${response.status}`,
    );
  }

  const data =
    (json as ApiResponse<LemonCheckoutResponse>)?.data ??
    (json as any)?.data ??
    json;
  const checkoutUrl = data?.checkoutUrl ?? data?.checkout_url;

  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    throw new Error("Không nhận được đường dẫn thanh toán từ máy chủ.");
  }

  return { checkoutUrl };
};

/**
 * Xác nhận thanh toán (theo orderId): POST /api/orders/:orderId/payments/confirm
 * Dùng orderId, idempotent (gọi lại vẫn OK).
 */
export const confirmPayment = async (
  orderId: number,
): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/orders/payments/${orderId}/confirm`,
    {
      method: "POST",
      headers: requireAuthHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
      body: JSON.stringify({}),
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (json as { message?: string })?.message ?? `HTTP ${response.status}`,
    );
  }
  const api = json as ApiResponse<unknown>;
  return { success: api.success ?? response.ok, message: api.message };
};

/**
 * Xác nhận thanh toán qua cổng: POST /api/payments/:paymentId/confirm
 * Dùng paymentId từ URL cổng thanh toán.
 */
export const confirmPaymentByPaymentId = async (
  paymentId: number | string,
): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/orders/payments/${paymentId}/confirm`,
    {
      method: "POST",
      headers: requireAuthHeaders({
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      }),
      body: JSON.stringify({}),
    },
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (json as { message?: string })?.message ?? `HTTP ${response.status}`,
    );
  }
  const api = json as ApiResponse<unknown>;
  return { success: api.success ?? response.ok, message: api.message };
};
