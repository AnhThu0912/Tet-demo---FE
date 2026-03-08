import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Orders from "./pages/Orders";
import Cart from "./components/Cart";
import ProductModal from "./components/ProductModal";
import { Product, CartItem, Category } from "./types";
import { getProducts, getProductById, normalizeProduct } from "./api/products";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  CartItem as ApiCartItem,
  CartSummary,
} from "./api/cart";
import { checkoutOrder } from "./api/orders";
import { AuthData, getAuthData, setAuthData, clearAuthData } from "./utils/auth";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const existing = getAuthData();
    if (existing) {
      setAuth(existing);
    }
  }, []);

  const addNotification = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setNotifications({ msg, type });
      setTimeout(() => setNotifications(null), 3500);
    },
    [],
  );

  // Helper: convert API CartItem sang UI CartItem. Đọc cả lineTotal/line_total để suy đơn giá nếu product không có price.
  const convertApiCartItemToUiCartItem = (apiItem: ApiCartItem): CartItem => {
    const raw = apiItem.product ?? (apiItem as { product?: unknown }).product;
    const quantity = apiItem.quantity;
    const lineTotal =
      (apiItem as ApiCartItem & { lineTotal?: number }).lineTotal ??
      (apiItem as { line_total?: number }).line_total;

    let product =
      raw != null && typeof raw === "object"
        ? normalizeProduct(raw as Record<string, unknown>)
        : {
            id:
              apiItem.productId ??
              (apiItem as { product_id?: number }).product_id ??
              0,
            name: "",
            price: 0,
            category: Category.FOOD,
            isActive: true,
            image: "",
          };

    // Nếu đơn giá = 0 nhưng API trả lineTotal thì suy price từ lineTotal / quantity
    if (
      product.price === 0 &&
      typeof lineTotal === "number" &&
      lineTotal >= 0 &&
      quantity > 0
    ) {
      product = { ...product, price: Math.round(lineTotal / quantity) };
    }

    return { ...product, quantity };
  };

  // When returning from payment result with "Xem đơn hàng", open orders tab and trigger refetch
  const [refreshOrdersKey, setRefreshOrdersKey] = useState(0);
  useEffect(() => {
    const state = location.state as { openPage?: string } | null;
    if (state?.openPage === "orders") {
      setActivePage("orders");
      setRefreshOrdersKey((k) => k + 1);
    }
  }, [location.state]);

  // Redirect from LemonSqueezy: ?payment=success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      setActivePage("orders");
      setRefreshOrdersKey((k) => k + 1);
      addNotification("Thanh toán thành công! Đơn hàng đang được xử lý.");
      // Xoá query param khỏi URL
      navigate("/", { replace: true });
    }
  }, [location.search, navigate, addNotification]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsList = await getProducts();
        setProducts(productsList);
      } catch (error) {
        console.error("Error loading products:", error);
        addNotification("Không thể tải danh sách sản phẩm từ API", "error");
      }
    };

    fetchProducts();
  }, [addNotification]);

  // Fetch cart từ API khi component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        setCartItems(cartData.items.map(convertApiCartItemToUiCartItem));
        setCartSummary(cartData.summary ?? null);
      } catch (error) {
        console.error("Error loading cart:", error);
        // Không hiển thị notification vì có thể cart rỗng là bình thường
      }
    };

    fetchCart();
  }, []);

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!auth) {
      addNotification("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.", "error");
      setActivePage("login");
      return;
    }
    try {
      const existing = cartItems.find((item) => item.id === product.id);

      let cartData;
      if (existing) {
        // Sản phẩm đã có trong giỏ: cập nhật số lượng tuyệt đối
        const newQuantity = existing.quantity + quantity;
        cartData = await updateCartItem(product.id, newQuantity);
      } else {
        // Sản phẩm chưa có trong giỏ: thêm mới
        cartData = await addToCart(product.id, quantity);
      }

      setCartItems(cartData.items.map(convertApiCartItemToUiCartItem));
      setCartSummary(cartData.summary ?? null);

      addNotification(`🧧 Đã thêm ${quantity}x ${product.name} vào giỏ lộc!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      addNotification("Không thể thêm sản phẩm vào giỏ hàng", "error");
    }
  };

  const handleQuickAdd = (product: Product) => {
    handleAddToCart(product, 1);
  };

  const updateCartQuantity = async (id: number, delta: number) => {
    try {
      const existing = cartItems.find((item) => item.id === id);
      if (!existing) return;

      const newQty = Math.max(1, existing.quantity + delta);

      // Gọi API để update cart
      const cartData = await updateCartItem(id, newQty);
      setCartItems(cartData.items.map(convertApiCartItemToUiCartItem));
      setCartSummary(cartData.summary ?? null);
    } catch (error) {
      console.error("Error updating cart:", error);
      addNotification("Không thể cập nhật giỏ hàng", "error");
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      // Gọi API để xóa item khỏi cart
      const cartData = await removeCartItem(id);
      setCartItems(cartData.items.map(convertApiCartItemToUiCartItem));
      setCartSummary(cartData.summary ?? null);
    } catch (error) {
      console.error("Error removing from cart:", error);
      addNotification("Không thể xóa sản phẩm khỏi giỏ hàng", "error");
    }
  };

  const handleSubmitOrder = async () => {
    if (!auth) {
      addNotification(
        "Bạn cần đăng nhập để đặt hàng và lưu đơn vào tài khoản.",
        "error",
      );
      setActivePage("login");
      return;
    }
    try {
      const res = await checkoutOrder();
      addNotification(
        res.message ?? "Xuân này sum vầy! Đặt hàng thành công!",
        "success",
      );
      setCartItems([]);
      setCartSummary(null);
      setIsCartOpen(false);
      setActivePage("orders");
    } catch (error) {
      console.error("Checkout error:", error);
      addNotification(
        error instanceof Error
          ? error.message
          : "Không thể đặt hàng. Vui lòng thử lại.",
        "error",
      );
    }
  };

  const handleLoginSuccess = (data: AuthData) => {
    setAuth(data);
    setAuthData(data);
    addNotification(
      data.user.role === "admin"
        ? "Đăng nhập admin thành công."
        : "Đăng nhập người dùng thành công.",
    );
    setActivePage(data.user.role === "admin" ? "admin" : "home");
  };

  const handleLogout = () => {
    clearAuthData();
    setAuth(null);
    setActivePage("home");
    addNotification("Đã đăng xuất khỏi hệ thống.");
  };

  const handleViewDetails = async (product: Product) => {
    try {
      // Fetch chi tiết sản phẩm từ API
      const productDetail = await getProductById(product.id);
      setSelectedProduct(productDetail);
    } catch (error) {
      console.error("Error loading product details:", error);
      addNotification("Không thể tải chi tiết sản phẩm", "error");
      // Fallback: hiển thị product từ danh sách nếu API fail
      setSelectedProduct(product);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <Home
            products={products}
            onNavigate={setActivePage}
            onAddToCart={handleQuickAdd}
          />
        );
      case "store":
        return (
          <Store
            onAddToCart={handleQuickAdd}
            onViewDetails={handleViewDetails}
          />
        );
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case "admin":
        return auth?.user.role === "admin" ? (
          <Admin initialProducts={products} />
        ) : (
          <Home
            products={products}
            onNavigate={setActivePage}
            onAddToCart={handleQuickAdd}
          />
        );
      case "orders":
        if (!auth) {
          return (
            <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center px-4">
              <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Bạn cần đăng nhập để xem đơn hàng
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Vui lòng đăng nhập bằng tài khoản user để xem lịch sử đơn hàng của bạn.
                </p>
                <button
                  onClick={() => setActivePage("login")}
                  className="px-6 py-2.5 rounded-xl bg-tet-red text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          );
        }
        const orderState = location.state as {
          openPage?: string;
          justPaidOrderId?: number;
        } | null;
        return (
          <Orders
            key={refreshOrdersKey}
            justPaidOrderId={orderState?.justPaidOrderId}
            onNavigate={setActivePage}
            onNotify={addNotification}
            onNavigateToPayment={(paymentId, orderId) =>
              navigate(`/payment/${paymentId}?orderId=${orderId}`)
            }
          />
        );
      default:
        return (
          <Home
            products={products}
            onNavigate={setActivePage}
            onAddToCart={handleQuickAdd}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5]">
      <Header
        onNavigate={setActivePage}
        activePage={activePage}
        isAuthenticated={!!auth}
        isAdmin={auth?.user.role === "admin"}
        onLogout={handleLogout}
      />

      {/* Toast Notifications */}
      {notifications && (
        <div
          className={`fixed top-28 right-8 z-[200] px-8 py-4 rounded-2xl shadow-2xl border-b-4 flex items-center gap-3 animate-slideInRight ${
            notifications.type === "success"
              ? "bg-[#4E342E] text-tet-gold border-tet-gold"
              : "bg-red-600 text-white border-red-800"
          }`}
        >
          <span className="text-2xl">
            {notifications.type === "success" ? "✨" : "⚠️"}
          </span>
          <span className="font-bold">{notifications.msg}</span>
        </div>
      )}

      {/* Floating Cart Button */}
      {!isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-12 right-12 z-[110] bg-tet-red text-white p-5 rounded-full shadow-2xl border-4 border-tet-gold hover:scale-110 active:scale-95 transition-all stamp-btn group"
        >
          <span className="absolute -top-3 -right-3 bg-tet-gold text-tet-red font-black text-sm w-8 h-8 rounded-full flex items-center justify-center border-2 border-tet-red shadow-lg group-hover:rotate-12">
            {cartItems.reduce((s, i) => s + i.quantity, 0)}
          </span>
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </button>
      )}

      <main className="flex-grow">{renderPage()}</main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        summary={cartSummary}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onSubmitOrder={handleSubmitOrder}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default App;
