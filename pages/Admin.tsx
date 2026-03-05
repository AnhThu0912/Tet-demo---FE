import React, { useState, useEffect } from "react";
import { Category, Product } from "../types";
import { getOrders, getOrderById, OrderListItem, OrderDetailData } from "../api/orders";
import { formatVND } from "../utils/format";

interface AdminProps {
  initialProducts: Product[];
}

const Admin: React.FC<AdminProps> = ({ initialProducts }) => {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const data = await getOrders();
        setOrders(data.items ?? []);
      } catch (e) {
        setOrders([]);
        setOrdersError(
          e instanceof Error ? e.message : "Không tải được danh sách đơn hàng.",
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const filteredAdminProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Xóa sản phẩm này khỏi kho lộc?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const openOrderDetail = async (id: number) => {
    setDetailOrderId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getOrderById(id);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setDetailOrderId(null);
    setDetail(null);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] bg-[#F9F7F2]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col shadow-2xl">
        <div className="p-8 border-b-4 border-tet-gold bg-tet-red text-white">
          <h2 className="text-xl font-bold heading-serif">Quản Trị Chợ Tết</h2>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">
            Hệ thống lộc xuân 2024
          </p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          {[
            { id: "products", label: "Quản lý sản phẩm", icon: "📦" },
            { id: "orders", label: "Quản lý đơn hàng", icon: "📝" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center group ${
                activeTab === item.id
                  ? "bg-tet-red text-white shadow-xl scale-105"
                  : "text-gray-500 hover:bg-tet-gold/10 hover:text-tet-red"
              }`}
            >
              <span
                className={`mr-4 text-xl transition-transform group-hover:scale-125`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t bg-gray-50 text-center">
          <p className="text-[10px] text-gray-400 italic">
            Connected to Mock API Server v2.4.1
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-grow p-10 overflow-y-auto">
        {activeTab === "products" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="text-3xl font-bold text-[#4E342E] heading-serif mb-1">
                  Kho Hàng Lộc Xuân
                </h3>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
              <div className="relative min-w-[300px] flex-grow">
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc ID..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tet-red outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-4 top-3.5 text-xl">🔍</span>
              </div>

              <select
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-600"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="food">Món ăn</option>
                <option value="drink">Thức uống</option>
                <option value="game">Trò chơi</option>
              </select>

              <select
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Mọi trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#4E342E] text-tet-gold text-[11px] font-bold uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">Sản Phẩm</th>
                    <th className="px-8 py-5">Giá Niêm Yết</th>
                    <th className="px-8 py-5">Phân Loại</th>
                    <th className="px-8 py-5">Trạng Thái</th>
                    <th className="px-8 py-5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAdminProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-tet-gold/5 transition-colors group"
                    >
                      <td className="px-8 py-6 font-mono text-xs text-gray-400">
                        #{p.id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-800">
                        {p.name}
                      </td>
                      <td className="px-8 py-6 font-bold text-tet-red">
                        {p.price.toLocaleString()}đ
                      </td>
                      <td className="px-8 py-6 capitalize text-sm">
                        {p.category}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {p.isActive ? "Đang bán" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase underline">
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs uppercase underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-3xl font-bold text-[#4E342E] heading-serif mb-1">
              Quản Lý Đơn Hàng Tết
            </h3>
            {ordersLoading ? (
              <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-500 text-sm">
                Đang tải danh sách đơn hàng...
            </div>
            ) : ordersError ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl shadow-sm p-8 text-center">
                <p className="text-red-600 font-medium mb-2">
                  Không tải được danh sách đơn hàng.
                </p>
                <p className="text-red-500 text-sm">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-500 text-sm">
                Chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Mã Đơn</th>
                      <th className="px-8 py-4">Tổng Món</th>
                      <th className="px-8 py-4">Tổng Tiền</th>
                      <th className="px-8 py-4">Trạng Thái</th>
                      <th className="px-8 py-4">Thời Gian</th>
                      <th className="px-8 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-8 py-5 font-mono text-xs">
                          #{o.id}
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-700">
                          {o.total_quantity}
                        </td>
                        <td className="px-8 py-5 font-bold text-tet-red">
                          {formatVND(o.total_price)}
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              o.status === "completed" || o.status === "paid"
                                ? "bg-green-500 text-white"
                                : o.status === "pending"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-400 text-white"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-gray-400 text-xs">
                          {new Date(o.created_at).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => openOrderDetail(o.id)}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-tet-red text-white hover:bg-red-700 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailOrderId != null && (
              <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-[#FFFDF5] rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border-4 border-tet-gold">
                  <div className="p-6 border-b border-tet-gold/20 flex justify-between items-center bg-white/80">
                    <h2 className="text-xl font-bold text-tet-red">
                      Chi tiết đơn #{detailOrderId}
                    </h2>
                    <button
                      onClick={closeOrderDetail}
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
                      <ul className="space-y-4">
                        {detail.items.map((item, idx) => {
                          const anyItem = item as any;
                          const name =
                            anyItem.product?.name ??
                            anyItem.name ??
                            "Sản phẩm";
                          const category =
                            anyItem.product?.category ??
                            anyItem.category ??
                            "—";
                          return (
                            <li
                              key={idx}
                              className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 truncate">
                                  {name}
                                </p>
                                <p className="text-[10px] text-tet-gold font-bold uppercase tracking-widest">
                                  {category}
                                </p>
                              </div>
                              <div className="text-sm text-gray-700">
                                SL: <strong>{item.quantity}</strong>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
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
        )}
      </main>
    </div>
  );
};

export default Admin;
