import React, { useState, useEffect } from "react";
import { formatVND } from "../utils/format";
import {
  getOrders,
  getOrderById,
  OrderListItem,
  OrderDetailData,
} from "../api/orders";
import { createPayment, confirmPayment } from "../api/payments";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3C/svg%3E";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getLineTotal(item: {
  lineTotal?: number;
  line_total?: number;
}): number {
  if (typeof item.lineTotal === "number") return item.lineTotal;
  if (typeof (item as { line_total?: number }).line_total === "number")
    return (item as { line_total: number }).line_total;
  return 0;
}

function getItemDisplay(item: {
  product?: {
    name?: string;
    image?: string;
    category?: string;
    product_name?: string;
  };
  name?: string;
  product_name?: string;
  image?: string;
  category?: string;
}) {
  const product = item.product;
  return {
    name:
      product?.name ??
      (product as { product_name?: string })?.product_name ??
      item.name ??
      (item as { product_name?: string })?.product_name ??
      "",
    image: product?.image ?? item.image ?? "",
    category: product?.category ?? item.category ?? "",
  };
}

interface OrdersProps {
  onNavigate: (page: string) => void;
  onNotify?: (msg: string, type: "success" | "error") => void;
}

const Orders: React.FC<OrdersProps> = ({ onNavigate, onNotify }) => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

  const fetchOrders = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await getOrders();
      setOrders(data.items ?? []);
    } catch (e) {
      if (!silent)
        setError(e instanceof Error ? e.message : "Không tải được đơn hàng");
      setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePayOrder = async (orderId: number) => {
    setPayingOrderId(orderId);
    try {
      await createPayment(orderId);
      await confirmPayment(orderId);
      await fetchOrders(true);
      onNotify?.(
        "Thanh toán thành công! Đơn hàng đã được xác nhận.",
        "success",
      );
    } catch (e) {
      onNotify?.(
        e instanceof Error
          ? e.message
          : "Thanh toán thất bại. Vui lòng thử lại.",
        "error",
      );
    } finally {
      setPayingOrderId(null);
    }
  };

  const openDetail = async (id: number) => {
    setDetailOrderId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getOrderById(id);
      setDetail(data);
    } catch (e) {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOrderId(null);
    setDetail(null);
  };

  const totalPriceDetail =
    detail?.total_price != null
      ? Number(detail.total_price)
      : (detail?.items?.reduce((sum, it) => sum + getLineTotal(it), 0) ?? 0);

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold heading-serif text-tet-red mb-2">
            Đơn hàng của bạn
          </h1>
          <div className="w-24 h-1 bg-tet-gold mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Xem lại các đơn hàng đã đặt</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-tet-red font-medium animate-pulse">
              Đang tải đơn hàng...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => onNavigate("store")}
              className="mt-4 px-6 py-2 bg-tet-red text-white rounded-full font-medium"
            >
              Về cửa hàng
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-tet-gold/30 py-16 text-center">
            <div className="text-6xl mb-4 opacity-50">🧧</div>
            <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => onNavigate("store")}
              className="px-8 py-3 bg-tet-red text-white font-bold rounded-full shadow-lg stamp-btn"
            >
              Đi sắm Tết
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">
                      Mã đơn: <span className="text-tet-red">#{order.id}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày: {formatDate(order.created_at)}
                    </p>
                    <p className="text-sm">
                      Trạng thái:{" "}
                      <span
                        className={
                          order.status === "pending"
                            ? "text-amber-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {order.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng món: <strong>{order.total_quantity}</strong>
                    </p>
                    <p className="text-tet-red font-bold">
                      Tổng tiền: {formatVND(order.total_price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handlePayOrder(order.id)}
                        disabled={payingOrderId === order.id}
                        className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {payingOrderId === order.id
                          ? "Đang xử lý..."
                          : "Thanh toán"}
                      </button>
                    )}
                    <button
                      onClick={() => openDetail(order.id)}
                      className="px-5 py-2.5 bg-tet-red text-white font-medium rounded-xl hover:bg-red-700 transition-colors stamp-btn"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {orders.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate("store")}
              className="text-gray-500 hover:text-tet-red font-medium"
            >
              ← Tiếp tục sắm Tết
            </button>
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn */}
      {detailOrderId != null && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF5] rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border-4 border-tet-gold">
            <div className="p-6 border-b border-tet-gold/20 flex justify-between items-center bg-white/80">
              <h2 className="text-xl font-bold text-tet-red">
                Chi tiết đơn #{detailOrderId}
              </h2>
              <button
                onClick={closeDetail}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Đóng"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {detailLoading ? (
                <p className="text-center py-8 text-gray-500 animate-pulse">
                  Đang tải chi tiết...
                </p>
              ) : detail?.items && detail.items.length > 0 ? (
                <>
                  <ul className="space-y-4">
                    {detail.items.map((item, idx) => {
                      const display = getItemDisplay(
                        item as Parameters<typeof getItemDisplay>[0],
                      );
                      return (
                        <li
                          key={idx}
                          className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100"
                        >
                          <img
                            src={
                              display.image?.trim()
                                ? display.image
                                : PLACEHOLDER_IMAGE
                            }
                            alt=""
                            className="w-16 h-16 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-gray-800 truncate">
                              {display.name || "Sản phẩm"}
                            </p>
                            <p className="text-[10px] text-tet-gold font-bold uppercase tracking-widest">
                              {display.category || "—"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Số lượng: <strong>{item.quantity}</strong>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-6 pt-4 border-t-2 border-tet-gold/20 flex justify-between items-center">
                    <span className="font-bold text-gray-800">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-tet-red">
                      {formatVND(totalPriceDetail)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  Không có chi tiết đơn hàng.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
