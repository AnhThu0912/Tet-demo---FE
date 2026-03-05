import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getOrderById, OrderDetailData } from "../api/orders";

function formatAmount(value: string | number | undefined): string {
  if (value == null) return "0";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "0";
  return Math.round(n).toLocaleString("vi-VN");
}

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const status = searchParams.get("status");
  const reason = searchParams.get("reason") ?? "Có lỗi xảy ra. Vui lòng thử lại.";

  const state = location.state as { amount?: string; orderId?: number } | null;
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const orderIdParam = searchParams.get("orderId");
  const orderIdFromUrl = orderIdParam ? parseInt(orderIdParam, 10) : null;
  const orderId = state?.orderId ?? orderIdFromUrl ?? null;

  const isSuccess = status === "success";

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || Number.isNaN(orderId)) return;
      try {
        setLoadingOrder(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };

    if (isSuccess && !state?.amount) {
      fetchOrder();
    }
  }, [orderId, isSuccess, state?.amount]);

  const amount =
    state?.amount ??
    (order?.total_price != null ? formatAmount(order.total_price) : undefined);

  const displayOrderId =
    order?.id ?? state?.orderId ?? (orderIdFromUrl && !Number.isNaN(orderIdFromUrl) ? orderIdFromUrl : null);

  const transactionTime = new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleTryAgain = () => {
    navigate("/", { replace: true });
  };

  const handleViewOrder = () => {
    navigate("/", {
      replace: true,
      state: { openPage: "orders", justPaidOrderId: orderId ?? undefined },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-8 text-center">
          {isSuccess ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Thanh toán thành công
              </h1>
              <div className="mt-6 space-y-2 text-left bg-gray-50 rounded-xl p-4">
                {displayOrderId != null && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Mã đơn: </span>
                    #{displayOrderId}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Thời gian: </span>
                  {transactionTime}
                </p>
                {amount != null && amount !== "" && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Tổng tiền: </span>
                    {amount}đ
                  </p>
                )}
                {loadingOrder && (
                  <p className="text-xs text-gray-400 mt-1">Đang tải thông tin đơn hàng...</p>
                )}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleViewOrder}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors"
                >
                  Xem đơn hàng
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/", { replace: true })}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Quay về trang chủ
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
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
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 text-sm mt-2">{reason}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors"
                >
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/", { replace: true })}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Về giỏ hàng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
