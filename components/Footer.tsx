
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#4E342E] text-white/80 py-12 mt-auto border-t-8 border-[#C62828]">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-[#FFD700] text-xl font-bold mb-4 heading-serif">Chợ Tết Online</h3>
          <p className="text-sm leading-relaxed">
            Nơi lưu giữ hương vị Tết cổ truyền Việt Nam qua từng món ăn và trò chơi truyền thống.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <h4 className="text-white font-bold mb-4">Thông tin liên hệ</h4>
          <p className="text-lg font-bold text-[#FFD700]">Hotline: 1900-TET-2024</p>
          <div className="flex space-x-4 mt-4">
            <span className="p-2 bg-white/10 rounded-full hover:bg-tet-red transition-colors cursor-pointer">FB</span>
            <span className="p-2 bg-white/10 rounded-full hover:bg-tet-red transition-colors cursor-pointer">IG</span>
            <span className="p-2 bg-white/10 rounded-full hover:bg-tet-red transition-colors cursor-pointer">YT</span>
          </div>
        </div>
        <div className="italic text-center flex flex-col justify-center">
          <p className="text-[#FFD700] text-lg mb-2">"Xuân này hơn hẳn mấy xuân qua. Phúc lộc đưa nhau đến từng nhà."</p>
          <p className="text-xs opacity-50">&copy; 2024 Chợ Tết Online Demo. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
