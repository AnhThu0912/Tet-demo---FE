import React, { useState } from "react";
import { Product } from "../types";
import { formatVND } from "../utils/format";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#FFFDF5] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-4 border-tet-gold animate-zoomIn">
        <div className="flex flex-col md:flex-row">
          {/* Image Side */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-tet-red text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                {product.category}
              </span>
            </div>
          </div>

          {/* Info Side */}
          <div className="p-8 md:w-1/2 flex flex-col">
            <button
              onClick={onClose}
              className="self-end text-gray-400 hover:text-tet-red mb-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-bold heading-serif text-[#4E342E] mb-2">
              {product.name}
            </h2>
            <p className="text-2xl font-bold text-tet-red mb-6">
              {formatVND(product.price)}
            </p>

            <div className="space-y-4 flex-grow">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Trạng thái:</span>
                <span
                  className={`font-bold ${
                    product.isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {product.isActive ? "Đang bán" : "Tạm ngưng"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Danh mục:</span>
                <span className="font-bold capitalize">{product.category}</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed italic">
                Sản phẩm Tết truyền thống chất lượng cao, được tuyển chọn kỹ
                lưỡng mang lại hương vị ấm cúng cho gia đình bạn.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between bg-gray-100 p-2 rounded-xl">
                <span className="text-xs font-bold uppercase ml-2 text-gray-500">
                  Số lượng
                </span>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                disabled={!product.isActive}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all stamp-btn ${
                  product.isActive
                    ? "bg-tet-red text-white hover:bg-red-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {product.isActive ? "Thêm vào giỏ hàng" : "Hiện đang hết hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
