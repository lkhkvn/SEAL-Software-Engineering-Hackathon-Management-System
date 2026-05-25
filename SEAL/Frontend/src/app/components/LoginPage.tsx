import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: (userData: any) => void; // Thêm callback khi login thành công
}

export function LoginPage({ onNavigateToRegister, onLoginSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Trạng thái xử lý API
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Gọi API Backend (Nhớ thêm index.php do Apache của bạn chưa rewrite)
      const response = await fetch('http://localhost:8000/index.php/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      // 2. Kiểm tra nếu Backend báo lỗi hoặc HTTP Status không hợp lệ
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }

      // 3. Đăng nhập thành công -> Lưu Token bảo mật vào localStorage
      if (result.data && result.data.token) {
        localStorage.setItem('auth_token', result.data.token);
        
        // Gọi callback báo cho App biết đã đăng nhập thành công (để chuyển trang dashboard...)
        onLoginSuccess(result.data.user);
      }

    } catch (err: any) {
      // Bắt các lỗi kết nối hoặc lỗi do Exception từ AuthService bắn ra
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center text-blue-600 font-bold text-3xl mb-2">
          HACKATHON<span className="text-gray-900">Hub</span>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Đăng nhập vào tài khoản của bạn
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <button
            onClick={onNavigateToRegister}
            type="button"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            đăng ký tài khoản mới
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-200">
          
          {/* Vùng hiển thị thông báo lỗi từ PHP nếu có */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Ghi nhớ & Quên mật khẩu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Nút Đăng Nhập */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>

          {/* Đăng nhập bên thứ ba */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 shadow-sm">
                <span>Google</span>
              </button>
              <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 shadow-sm">
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}