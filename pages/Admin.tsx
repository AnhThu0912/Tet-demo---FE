
import React, { useState, useEffect } from 'react';
import { Category, Product, LogEntry } from '../types';

interface AdminProps {
  initialProducts: Product[];
}

const Admin: React.FC<AdminProps> = ({ initialProducts }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'logs'>('products');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Log Filters
  const [logMethod, setLogMethod] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredAdminProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? p.isActive : !p.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Fix: Explicitly cast the array to LogEntry[] to satisfy the 'method' union type constraint
  const logs: LogEntry[] = ([
    { id: '1', method: 'GET', endpoint: '/api/products', status: 200, timestamp: '2024-02-10 08:30:15' },
    { id: '2', method: 'POST', endpoint: '/api/orders', status: 201, timestamp: '2024-02-10 09:15:22' },
    { id: '3', method: 'PUT', endpoint: '/api/products/5', status: 200, timestamp: '2024-02-10 10:05:40' },
    { id: '4', method: 'DELETE', endpoint: '/api/products/12', status: 403, timestamp: '2024-02-10 11:20:05' },
    { id: '5', method: 'GET', endpoint: '/api/orders/details/442', status: 200, timestamp: '2024-02-10 12:45:00' },
    { id: '6', method: 'POST', endpoint: '/api/auth/login', status: 200, timestamp: '2024-02-10 13:00:10' },
  ] as LogEntry[]).filter(l => {
    const matchesMethod = logMethod === 'ALL' || l.method === logMethod;
    const matchesSearch = l.endpoint.toLowerCase().includes(logSearch.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const orders = [
    { id: 'ORD-2024-001', customer: 'Nguyễn Văn Xuân', phone: '0901234567', total: 450000, status: 'Completed', time: '10:30, 09/02' },
    { id: 'ORD-2024-002', customer: 'Trần Thị Mai', phone: '0987654321', total: 1200000, status: 'Processing', time: '11:15, 10/02' },
    { id: 'ORD-2024-003', customer: 'Lê Hoàng Đào', phone: '0912345678', total: 25000, status: 'Pending', time: '08:00, 11/02' },
  ];

  const handleDelete = (id: number) => {
    if (window.confirm('Xóa sản phẩm này khỏi kho lộc?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] bg-[#F9F7F2]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex flex-col shadow-2xl">
        <div className="p-8 border-b-4 border-tet-gold bg-tet-red text-white">
          <h2 className="text-xl font-bold heading-serif">Quản Trị Chợ Tết</h2>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Hệ thống lộc xuân 2024</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          {[
            { id: 'products', label: 'Quản lý sản phẩm', icon: '📦' },
            { id: 'orders', label: 'Quản lý đơn hàng', icon: '📝' },
            { id: 'logs', label: 'Nhật ký hệ thống', icon: '🖥️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center group ${
                activeTab === item.id 
                ? 'bg-tet-red text-white shadow-xl scale-105' 
                : 'text-gray-500 hover:bg-tet-gold/10 hover:text-tet-red'
              }`}
            >
              <span className={`mr-4 text-xl transition-transform group-hover:scale-125`}>{item.icon}</span> 
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t bg-gray-50 text-center">
          <p className="text-[10px] text-gray-400 italic">Connected to Mock API Server v2.4.1</p>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-grow p-10 overflow-y-auto">
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="text-3xl font-bold text-[#4E342E] heading-serif mb-1">Kho Hàng Lộc Xuân</h3>
                <p className="text-sm text-gray-500 italic">(UI only — thêm/sửa/xóa ảo tại demo này)</p>
              </div>
              <button className="px-8 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-xl hover:bg-green-700 transition-all stamp-btn flex items-center gap-2">
                <span>➕</span> Thêm Sản Phẩm Mới
              </button>
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
                    <tr key={p.id} className="hover:bg-tet-gold/5 transition-colors group">
                      <td className="px-8 py-6 font-mono text-xs text-gray-400">#{p.id.toString().padStart(4, '0')}</td>
                      <td className="px-8 py-6 font-bold text-gray-800">{p.name}</td>
                      <td className="px-8 py-6 font-bold text-tet-red">{p.price.toLocaleString()}đ</td>
                      <td className="px-8 py-6 capitalize text-sm">{p.category}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.isActive ? 'Đang bán' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase underline">Sửa</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase underline">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-3xl font-bold text-[#4E342E] heading-serif mb-1">Quản Lý Đơn Hàng Tết</h3>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Mã Đơn</th>
                    <th className="px-8 py-4">Khách Hàng</th>
                    <th className="px-8 py-4">SĐT</th>
                    <th className="px-8 py-4">Tổng Tiền</th>
                    <th className="px-8 py-4">Trạng Thái</th>
                    <th className="px-8 py-4">Thời Gian</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 font-mono text-xs">{o.id}</td>
                      <td className="px-8 py-5 font-bold">{o.customer}</td>
                      <td className="px-8 py-5 text-gray-500">{o.phone}</td>
                      <td className="px-8 py-5 font-bold text-tet-red">{o.total.toLocaleString()}đ</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          o.status === 'Completed' ? 'bg-green-500 text-white' : o.status === 'Processing' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
                        }`}>{o.status}</span>
                      </td>
                      <td className="px-8 py-5 text-gray-400 text-xs">{o.time}</td>
                      <td className="px-8 py-5">
                        <button className="p-2 hover:bg-gray-200 rounded-full">📄</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-3xl font-bold text-[#4E342E] heading-serif mb-1">Nhật Ký Hệ Thống</h3>
            
            <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border">
               <span className="text-xs font-bold text-gray-400 uppercase ml-2">Bộ lọc:</span>
               <select 
                 className="bg-gray-100 p-2 rounded-lg text-xs font-bold outline-none"
                 value={logMethod}
                 onChange={(e) => setLogMethod(e.target.value as any)}
               >
                 <option value="ALL">Mọi phương thức</option>
                 <option value="GET">GET</option>
                 <option value="POST">POST</option>
                 <option value="PUT">PUT</option>
                 <option value="DELETE">DELETE</option>
               </select>
               <input 
                 type="text" 
                 placeholder="Lọc endpoint..."
                 className="bg-gray-100 p-2 rounded-lg text-xs font-medium flex-grow outline-none border border-transparent focus:border-tet-red"
                 value={logSearch}
                 onChange={(e) => setLogSearch(e.target.value)}
               />
            </div>

            <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl border-[12px] border-[#2d2d2d] font-mono p-8">
               <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                 <div className="flex gap-3">
                   <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                   <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                   <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                 </div>
                 <span className="text-tet-gold text-[10px] font-bold tracking-[0.3em] uppercase">Tết System Logs v4.0.0</span>
               </div>
               
               <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                 {logs.length > 0 ? logs.map((log) => (
                   <div key={log.id} className="text-xs border-l-2 border-tet-gold/20 pl-6 py-2 hover:bg-white/5 transition-all group relative">
                     <span className="text-gray-500 font-mono">[{log.timestamp}]</span>{' '}
                     <span className={`px-2 py-0.5 rounded font-black mx-2 ${
                       log.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
                       log.method === 'POST' ? 'bg-green-500/20 text-green-400' : 
                       log.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                     }`}>{log.method}</span>{' '}
                     <span className="text-white font-medium group-hover:text-tet-gold transition-colors">{log.endpoint}</span>{' '}
                     <span className={`float-right font-bold ${log.status < 400 ? 'text-green-500' : 'text-red-500'}`}>{log.status}</span>
                   </div>
                 )) : (
                   <div className="text-gray-600 text-center py-10 italic">Không có nhật ký phù hợp...</div>
                 )}
                 <div className="text-tet-gold animate-pulse text-lg mt-6">_</div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
