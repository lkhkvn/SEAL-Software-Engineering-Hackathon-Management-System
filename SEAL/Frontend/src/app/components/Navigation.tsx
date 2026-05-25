import { Link, useLocation } from 'react-router-dom';
import { Trophy, Calendar, Users, Settings, Home, Award, LogIn } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/events', icon: Calendar, label: 'Sự kiện' },
    { path: '/teams', icon: Users, label: 'Đội thi' },
    { path: '/leaderboard', icon: Award, label: 'Bảng xếp hạng' },
    { path: '/admin', icon: Settings, label: 'Quản lý' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Bên trái: Logo thương hiệu */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Trophy className="text-blue-600" size={32} />
              <span className="font-bold text-xl text-gray-900 tracking-wider">SEAL</span>
            </Link>
          </div>

          {/* Ở giữa: Menu điều hướng chính */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bên phải: Cụm nút Đăng nhập / Đăng ký */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
            
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Đăng ký
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}