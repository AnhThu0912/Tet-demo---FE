import React, { useState, useEffect } from "react";
import { Category, Product } from "../types";
import { getProductsWithParams } from "../api/products";
import { formatVND } from "../utils/format";

interface StoreProps {
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ITEMS_PER_PAGE = 12;
// Data URI: ảnh placeholder nội bộ, không gọi mạng (tránh ERR_NAME_NOT_RESOLVED)
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";

const getImageSrc = (image: string | undefined): string => {
  if (!image || image.trim() === "") return PLACEHOLDER_IMAGE;
  return image;
};

const Store: React.FC<StoreProps> = ({ onAddToCart, onViewDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        if (searchTerm.trim()) {
          params.q = searchTerm.trim();
        }

        if (categoryFilter !== "all") {
          params.category = categoryFilter;
        }

        if (minPrice !== "") {
          params.minPrice = minPrice;
        }

        if (maxPrice !== "") {
          params.maxPrice = maxPrice;
        }

        const productsList = await getProductsWithParams(params);
        console.log("==>>> productsList", productsList);
        setProducts(productsList);
        // Tính totalPages dựa trên số lượng items trả về
        if (productsList.length < ITEMS_PER_PAGE) {
          // Nếu trả về ít hơn ITEMS_PER_PAGE, đây là trang cuối
          setTotalPages(currentPage);
        } else {
          // Nếu trả về đủ ITEMS_PER_PAGE, giả sử còn trang tiếp theo
          setTotalPages((prev) => Math.max(prev, currentPage + 1));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, minPrice, maxPrice]);

  // Reset về trang 1 khi search hoặc filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, minPrice, maxPrice]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-tet-red heading-serif mb-4 uppercase tracking-widest">
          Gian Hàng Tết
        </h2>
        <div className="w-24 h-1 bg-tet-gold mx-auto mb-4"></div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-tet-gold/20 mb-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Tìm món Tết… (ví dụ: bánh, hạt, nước…)"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-tet-red focus:ring-1 focus:ring-tet-red outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-6 h-6 text-gray-300 absolute left-4 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t pt-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center">
              Danh mục:
            </span>
            {["all", Category.FOOD, Category.DRINK, Category.GAME].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    categoryFilter === cat
                      ? "bg-tet-red text-white border-tet-red shadow-md"
                      : "bg-white text-gray-500 border-gray-200 hover:border-tet-gold"
                  }`}
                >
                  {cat === "all"
                    ? "Tất cả"
                    : cat === "food"
                    ? "Món ăn"
                    : cat === "drink"
                    ? "Thức uống"
                    : "Trò chơi"}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center">
              Khoảng giá:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ"
                className="w-24 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:border-tet-red focus:ring-1 focus:ring-tet-red outline-none transition-all"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Đến"
                className="w-24 px-3 py-1.5 rounded-xl border border-gray-200 text-sm focus:border-tet-red focus:ring-1 focus:ring-tet-red outline-none transition-all"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
              {(minPrice !== "" || maxPrice !== "") && (
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all border border-gray-200"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Danh sách sản phẩm
          </h3>
          <p className="text-sm text-gray-500">
            Trang <span className="font-bold text-tet-red">{currentPage}</span>{" "}
            / <span className="font-bold text-tet-red">{totalPages}</span>
            {!isLoading && (
              <span className="ml-2">({products.length} sản phẩm)</span>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl py-24 text-center border-2 border-dashed border-tet-gold/20 shadow-inner">
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          <p className="text-gray-400 italic">Đang tải sản phẩm...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all border border-gray-100 group flex flex-col h-full"
              >
                <div className="relative overflow-hidden h-56 rounded-t-2xl">
                  <img
                    src={getImageSrc(p.image)}
                    alt={p.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                      !p.isActive && "grayscale opacity-60"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-lg ${
                        p.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {p.isActive ? "ĐANG BÁN" : "HẾT HÀNG"}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-tet-gold uppercase tracking-tighter">
                      {p.category}
                    </span>
                    <div className="h-px bg-tet-gold/20 flex-grow"></div>
                  </div>
                  <h4 className="font-bold text-xl mb-1 text-gray-800">
                    {p.name}
                  </h4>
                  <p className="text-2xl font-bold text-tet-red mb-6">
                    {formatVND(p.price)}
                  </p>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onViewDetails(p)}
                      className="py-2.5 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      disabled={!p.isActive}
                      onClick={() => onAddToCart(p)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-md stamp-btn ${
                        p.isActive
                          ? "bg-tet-red text-white hover:bg-red-700"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-tet-red border-2 border-tet-red hover:bg-tet-red hover:text-white shadow-md"
                }`}
              >
                ‹ Trước
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-tet-red text-white shadow-lg scale-110"
                          : "bg-white text-tet-red border-2 border-tet-red hover:bg-tet-red hover:text-white shadow-md"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  currentPage >= totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-tet-red border-2 border-tet-red hover:bg-tet-red hover:text-white shadow-md"
                }`}
              >
                Sau ›
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl py-24 text-center border-2 border-dashed border-tet-gold/20 shadow-inner">
          <div className="text-8xl mb-6 grayscale opacity-30">🏮</div>
          <h3 className="text-2xl font-bold text-gray-400 mb-2">
            Không có sản phẩm nào
          </h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 italic">
            Không tìm thấy sản phẩm trên trang này.
          </p>
        </div>
      )}
    </div>
  );
};

export default Store;
