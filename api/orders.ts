import { getAuthToken } from "../utils/auth";
import { API_BASE_URL } from "../config/env";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CheckoutPayload {
  name?: string;
  phone?: string;
  address?: string;
  note?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: { orderId: number };
  message?: string;
}

// GET /api/orders
export interface OrderListItem {
  id: number;
  total_quantity: number;
  total_price: string;
  status: string;
  created_at: string;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersListData {
  items: OrderListItem[];
  pagination: OrdersPagination;
}

// GET /api/orders/:id (chi tiết đơn)
export interface OrderDetailItemProduct {
  image?: string;
  name?: string;
  category?: string;
}

export interface OrderDetailItem {
  product?: OrderDetailItemProduct;
  quantity: number;
  lineTotal?: number;
  line_total?: number;
}

export interface OrderDetailData {
  id: number;
  created_at?: string;
  status?: string;
  total_quantity?: number;
  total_price?: string | number;
  items?: OrderDetailItem[];
}

const withAuthHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

/**
 * Đặt hàng: POST /orders/checkout (dùng giỏ hàng hiện tại).
 * Response: { success: true, data: { orderId }, message: "Checkout thành công" }
 */
export const checkoutOrder = async (payload?: CheckoutPayload): Promise<CheckoutResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: withAuthHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    }),
    body: JSON.stringify({
      name: payload?.name ?? '',
      phone: payload?.phone ?? '',
      address: payload?.address ?? '',
      note: payload?.note ?? '',
    }),
  });

  const json = await response.json();
  const result = (json as ApiResponse<{ orderId: number }>)?.success != null ? json : { success: response.ok, data: json?.data, message: json?.message };

  if (!response.ok) {
    throw new Error((result as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  return result as CheckoutResponse;
};

/**
 * Danh sách đơn hàng: GET /api/orders
 */
export const getOrders = async (): Promise<OrdersListData> => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    cache: 'no-store',
    headers: withAuthHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache' }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const data = (json as ApiResponse<OrdersListData>)?.data ?? json?.data ?? json;
  if (data?.items) return data as OrdersListData;
  throw new Error('Unexpected orders response');
};

/**
 * Chi tiết đơn hàng: GET /api/orders/:id
 */
export const getOrderById = async (id: number): Promise<OrderDetailData> => {
  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    cache: 'no-store',
    headers: withAuthHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache' }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json = await response.json();
  const data = (json as ApiResponse<OrderDetailData>)?.data ?? json?.data ?? json;
  if (data && typeof data === 'object' && 'id' in data) return data as OrderDetailData;
  throw new Error('Unexpected order detail response');
};
