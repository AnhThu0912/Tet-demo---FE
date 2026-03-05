import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getOrderById, OrderDetailData } from "../api/orders";
import { confirmPayment, createLemonCheckout } from "../api/payments";
import PaymentMethodCard, {
  PaymentMethodId,
} from "../components/payment/PaymentMethodCard";
import CountdownTimer from "../components/payment/CountdownTimer";
import LoadingButton from "../components/payment/LoadingButton";

const COUNTDOWN_SECONDS = 5 * 60; // 5 minutes

function formatAmount(value: string | number | undefined): string {
  if (value == null) return "0";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "0";
  return Math.round(n).toLocaleString("vi-VN");
}

const PAYMENT_METHODS: {
  id: PaymentMethodId;
  label: string;
  description?: string;
}[] = [
  {
    id: "fake_gateway",
    label: "Fake Gateway",
    description: "Thanh toán trong nước ",
  },
  {
    id: "lemonsqueezy",
    label: "Lemon Squeezy",
    description: "Thanh toán quốc tế",
  },
];

const PaymentPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodId>("fake_gateway");
  const [confirming, setConfirming] = useState(false);
  const [expired, setExpired] = useState(false);

  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;

  const fetchOrder = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setLoading(false);
      setError("Thiếu thông tin đơn hàng.");
      return;
    }
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
      setError(null);
      if (data.status === "paid" || data.status === "completed") {
        navigate(`/payment-result?paymentId=${paymentId}&status=success`, {
          replace: true,
          state: { amount: formatAmount(data.total_price) },
        });
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được đơn hàng.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, paymentId, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleExpire = useCallback(() => {
    setExpired(true);
  }, []);

  const handleConfirm = async () => {
    if (confirming || expired) return;

    if (!orderId || Number.isNaN(orderId)) {
      setError("Thiếu thông tin đơn hàng.");
      return;
    }

    setConfirming(true);
    try {
      if (paymentMethod === "fake_gateway") {
        await confirmPayment(orderId);
        const amount = order ? formatAmount(order.total_price) : "";
        navigate(`/payment-result?status=success&orderId=${orderId}`, {
          replace: true,
          state: {
            amount,
            orderId,
          },
        });
      } else if (paymentMethod === "lemonsqueezy") {
        const { checkoutUrl } = await createLemonCheckout(orderId);
        window.location.href = checkoutUrl;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Thanh toán thất bại.";
      navigate(
        `/payment-result?status=failed&reason=${encodeURIComponent(message)}`,
        { replace: true },
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = order?.total_price != null ? order.total_price : 0;
  const displayAmount = formatAmount(totalPrice);
  const orderLabel = order?.id != null ? `Đơn hàng #${order.id}` : "Đơn hàng";

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Cổng Thanh Toán</h1>
          <p className="text-gray-500 text-sm mt-1">{orderLabel}</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">
            {displayAmount}
            <span className="text-lg font-semibold text-gray-600 ml-1">đ</span>
          </p>
        </div>

        {/* Payment methods */}
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Chọn phương thức thanh toán
          </p>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodCard
                key={method.id}
                id={method.id}
                label={method.label}
                description={method.description}
                selected={paymentMethod === method.id}
                onSelect={() => setPaymentMethod(method.id)}
                disabled={expired}
              />
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div className="px-6 py-2">
          <CountdownTimer
            totalSeconds={COUNTDOWN_SECONDS}
            onExpire={handleExpire}
          />
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          <LoadingButton
            onClick={handleConfirm}
            loading={confirming}
            disabled={expired}
            variant="primary"
          >
            Thanh toán ngay
          </LoadingButton>
          <LoadingButton
            onClick={handleCancel}
            disabled={confirming}
            variant="secondary"
          >
            Hủy giao dịch
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
