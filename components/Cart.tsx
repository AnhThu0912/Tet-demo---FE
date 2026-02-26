import React, { useState } from "react";
import { CartItem } from "../types";
import type { CartSummary } from "../api/cart";

interface CartProps {
  items: CartItem[];
  /** Tổng từ API cart (ưu tiên dùng thay vì tính từ items) */
  summary?: CartSummary | null;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onSubmitOrder: () => void | Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  summary,
  onUpdateQuantity,
  onRemove,
  onSubmitOrder,
  isOpen,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tổng tiền: ưu tiên summary từ API; nếu API trả 0 hoặc không có thì tính từ items (tránh hiển thị 0đ khi có món)
  const totalFromItems = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalFromApi =
    summary != null && typeof summary.totalPrice === "number"
      ? summary.totalPrice
      : null;
  const total =
    totalFromApi != null && totalFromApi > 0 ? totalFromApi : totalFromItems;
  const totalQuantity =
    summary != null && typeof summary.totalQuantity === "number"
      ? summary.totalQuantity
      : items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmitOrder());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-lg bg-[#FFFDF5] h-full shadow-2xl flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="bg-tet-red text-white p-8 flex justify-between items-center border-b-8 border-tet-gold shadow-lg">
          <div>
            <h2 className="text-3xl font-bold heading-serif flex items-center">
              <span className="mr-3 text-3xl">🧺</span> Giỏ Hàng Tết
            </h2>
            <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">
              Sắm đủ đầy - Xuân sum vầy
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-full transition-colors group"
          >
            <svg
              className="w-8 h-8 group-hover:rotate-90 transition-transform"
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

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 opacity-20">🧧</div>
              <p className="text-gray-400 font-medium italic text-lg">
                Bạn chưa chọn lộc Tết nào...
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-tet-red text-white font-bold rounded-full shadow-lg stamp-btn"
              >
                Đi sắm Tết ngay!
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Items List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
                  Danh sách món đã chọn
                </h3>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                      />
                      <button
                        onClick={() => onRemove(item.id)}
                        className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="font-bold text-tet-red">
                            {item.name}
                          </h2>
                          <span className="text-[10px] text-tet-gold font-bold uppercase tracking-widest">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-tet-red font-bold">
                          {(item.price * item.quantity).toLocaleString()}đ
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-tet-red"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-black text-gray-400 hover:text-tet-red"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          Đơn giá: {item.price.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Header (theo API cart: totalPrice, totalQuantity) */}
              <div className="bg-[#4E342E] text-white p-6 rounded-2xl shadow-xl flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <span className="text-lg font-medium opacity-80">
                    Tổng đơn hàng
                  </span>
                  {totalQuantity > 0 && (
                    <span className="ml-2 text-sm opacity-70">
                      ({totalQuantity} món)
                    </span>
                  )}
                </div>
                <span className="text-3xl font-bold text-tet-gold">
                  {total.toLocaleString()}đ
                </span>
              </div>

              {/* Checkout Section */}
              <div className="bg-white p-8 rounded-3xl border-2 border-tet-gold/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-tet-gold/10 -rotate-45 translate-x-12 -translate-y-12"></div>
                <h3 className="font-bold text-2xl heading-serif text-[#4E342E] mb-6 text-center border-b-2 border-dashed border-tet-gold/20 pb-4">
                  🧧 Gửi Lộc Tận Nhà
                </h3>

                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-xl transition-all stamp-btn flex items-center justify-center gap-3 ${
                      isSubmitting
                        ? "bg-gray-400"
                        : "bg-[#C62828] hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">
                        Đang chuẩn bị lộc...
                      </span>
                    ) : (
                      <>ĐẶT HÀNG ĐÓN TẾT 🧧</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
