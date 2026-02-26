const API_BASE_URL = "http://localhost:3001/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    body: JSON.stringify({}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      (json as { message?: string })?.message ?? `HTTP ${response.status}`,
    );
  }

  const data =
    (json as ApiResponse<{ paymentId?: number }>)?.data ??
    (json as any)?.data ??
    json;
  const paymentId = data?.paymentId ?? data?.payment_id;
  return { paymentId: typeof paymentId === "number" ? paymentId : undefined };
};

/**
 * Xác nhận thanh toán: POST /api/orders/:orderId/payments/confirm
 * Dùng orderId, idempotent (gọi lại vẫn OK).
 */
export const confirmPayment = async (
  orderId: number,
): Promise<{ success: boolean; message?: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/orders/payments/${orderId}/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
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
