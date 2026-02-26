import React, { useState, useEffect, useCallback } from "react";
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

const App: React.FC = () => {
  const [activePage, setActivePage] = useState("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notifications, setNotifications] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const addNotification = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setNotifications({ msg, type });
      setTimeout(() => setNotifications(null), 3500);
    },
    []
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
    try {
      // Tìm item hiện tại trong cart để tính quantity mới
      const existing = cartItems.find((item) => item.id === product.id);
      const newQuantity = existing ? existing.quantity + quantity : quantity;

      // Gọi API để thêm/update cart
      const cartData = await addToCart(product.id, newQuantity);
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
    try {
      const res = await checkoutOrder();
      addNotification(
        res.message ?? "Xuân này sum vầy! Đặt hàng thành công!",
        "success"
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
        "error"
      );
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActivePage("admin");
    addNotification("Kính chào chủ quán trở lại hệ thống!");
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
        return isAuthenticated ? (
          <Admin initialProducts={products} />
        ) : (
          <Login onLogin={handleLogin} />
        );
      case "admin":
        return isAuthenticated ? (
          <Admin initialProducts={products} />
        ) : (
          <Login onLogin={handleLogin} />
        );
      case "orders":
        return (
          <Orders
            onNavigate={setActivePage}
            onNotify={addNotification}
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
      <Header onNavigate={setActivePage} activePage={activePage} />

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
      {cartItems.length > 0 && !isCartOpen && (
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
