
import React, { useState } from 'react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activePage,
  isAuthenticated,
  isAdmin,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Trang chủ", id: "home" as const },
    { label: "Gian hàng", id: "store" as const },
    {
      label: isAdmin ? "Admin" : "Đơn hàng",
      id: isAdmin ? ("admin" as const) : ("orders" as const),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#C62828] text-white shadow-lg border-b-4 border-[#FFD700]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight heading-serif text-[#FFD700]">
              Chợ Tết Online
            </h1>
            {isAdmin && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFD700] text-[#C62828] uppercase tracking-widest">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs italic font-medium opacity-90 tracking-widest uppercase">
            Sắm Tết đủ đầy – Vui xuân trọn vẹn
          </p>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1 font-medium transition-all hover:text-[#FFD700] border-b-2 ${
                activePage === item.id ? 'border-[#FFD700] text-[#FFD700]' : 'border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              if (isAuthenticated) {
                onLogout();
              } else {
                onNavigate('login');
              }
            }}
            className={`ml-4 px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
              isAuthenticated
                ? 'border-white text-white hover:bg-white hover:text-[#C62828]'
                : 'border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#C62828]'
            }`}
          >
            {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#A51E1E] border-t border-[#FFD700] py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }}
              className="block w-full text-left px-6 py-3 font-medium hover:bg-[#C62828] border-b border-white/10"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              if (isAuthenticated) {
                onLogout();
              } else {
                onNavigate('login');
              }
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-6 py-3 font-medium hover:bg-[#C62828] border-b border-white/10"
          >
            {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
