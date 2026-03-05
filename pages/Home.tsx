import React from "react";
import { API_ORIGIN } from "../config/env";
import { Category, Product } from "../types";

const resolveImageSrc = (src?: string) => {
  if (!src) return "https://via.placeholder.com/800x600?text=No+Image";
  if (/^https?:\/\//i.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
};

interface HomeProps {
  onNavigate: (page: string) => void;
  onAddToCart: (product: Product) => void;
  products: Product[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, onAddToCart, products }) => {
  const topProducts = products.filter((p) => p.isActive).slice(0, 6);
  const games = products.filter(
    (p) => p.category === Category.GAME && p.isActive,
  );

  return (
    <div className="space-y-24 animate-fadeIn pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#C62828] border-b-8 border-tet-gold shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1549415132-472e29336183?auto=format&fit=crop&q=80&w=2000"
            alt="Tet Atmosphere"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-110"
          />
        </div>

        {/* Animated decorative sparks */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-tet-gold rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-tet-gold rounded-full animate-ping opacity-20 delay-1000"></div>
        <div className="absolute bottom-60 left-1/4 w-2 h-2 bg-tet-gold rounded-full animate-ping opacity-40 delay-500"></div>

        <div className="relative text-center z-10 px-6">
          <div className="inline-block px-4 py-1 bg-tet-gold text-tet-red text-[10px] font-bold tracking-[0.3em] uppercase rounded-full mb-6 shadow-lg">
            Xuân Bính Ngọ 2026
          </div>
          <h2 className="text-6xl md:text-9xl font-bold text-tet-gold mb-8 heading-serif drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight">
            Chợ Tết <br /> Online
          </h2>
          <p className="text-white text-xl md:text-2xl mb-12 max-w-2xl mx-auto italic font-medium opacity-90">
            "Sắm Tết đủ đầy – Vui xuân trọn vẹn"
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => onNavigate("store")}
              className="px-12 py-5 bg-tet-gold text-tet-red font-bold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl stamp-btn"
            >
              Vào Gian Hàng
            </button>
            <button
              onClick={() => onNavigate("store")}
              className="px-12 py-5 bg-transparent border-2 border-white text-white font-bold rounded-2xl hover:scale-105 hover:bg-yellow-500 hover:text-red-500 transition-all text-xl stamp-btn"
            >
              Mua Nhanh
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-tet-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
            Gợi Ý Xuân Này
          </span>
          <h3 className="text-4xl md:text-5xl font-bold text-[#4E342E] heading-serif mb-4">
            Món Tết Bán Chạy
          </h3>
          <div className="h-1 w-32 bg-tet-gold rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {topProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 p-6 relative group flex flex-col"
            >
              <div className="relative h-60 rounded-2xl overflow-hidden mb-6">
                <img
                  src={resolveImageSrc(p.image)}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src =
                      "https://via.placeholder.com/800x600?text=No+Image";
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#4E342E] text-tet-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-2xl text-gray-800">{p.name}</h4>
                <div className="text-right">
                  <span className="text-tet-red font-black text-xl">
                    {p.price.toLocaleString()}đ
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Đang bán chạy
                </span>
              </div>
              <button
                onClick={() => onAddToCart(p)}
                className="mt-auto w-full py-4 bg-tet-red text-white rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl stamp-btn"
              >
                Thêm vào giỏ
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section className="bg-white/50 py-24 border-y border-tet-gold/20 shadow-inner relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-tet-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-tet-red/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-tet-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
              Gắn Kết Thành Viên
            </span>
            <h3 className="text-4xl md:text-5xl font-bold text-[#4E342E] heading-serif mb-4">
              Trò Vui Ngày Tết
            </h3>
            <div className="h-1 w-32 bg-tet-red rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {games.map((game) => (
              <div
                key={game.id}
                className="text-center group cursor-pointer bg-white p-8 rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all border border-gray-50"
                onClick={() => onNavigate("store")}
              >
                <div className="w-28 h-28 bg-tet-red rounded-[30px] mx-auto flex items-center justify-center text-tet-gold text-4xl font-bold mb-6 shadow-xl group-hover:rotate-12 transition-transform duration-500 ring-4 ring-tet-gold/10">
                  {game.name[0]}
                </div>
                <h5 className="font-bold text-xl text-[#4E342E] mb-1">
                  {game.name}
                </h5>
                <p className="text-tet-red font-bold text-lg">
                  {game.price.toLocaleString()}đ
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">
                  Bấm để xem
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
