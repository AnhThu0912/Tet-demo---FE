
import React, { useState } from 'react';
import { login, LoginResponse } from '../api/auth';

interface LoginProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      onLoginSuccess(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-t-8 border-tet-red">
        <div className="bg-tet-red/5 p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-tet-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-tet-gold/50">
             <svg className="w-8 h-8 text-tet-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h2 className="text-3xl font-bold heading-serif text-tet-red">Đăng Nhập</h2>
          <p className="text-gray-500 mt-2 italic">Sử dụng tài khoản admin hoặc user</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tet-red outline-none transition-all"
              placeholder="admin@example.com hoặc user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tet-red outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-tet-red text-white font-bold rounded-xl shadow-xl hover:bg-red-700 transition-all stamp-btn text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
          
          <div className="text-center">
             <button type="button" className="text-sm text-gray-500 hover:underline">Quên mật khẩu?</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
