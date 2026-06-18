import { Link, useLocation } from 'react-router-dom';
import { Trophy, Calendar, Users, Settings, Home, Award, LogIn, LogOut, Upload, CheckSquare } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
interface NavigationProps {
  currentUser: any;
  onLogout: () => void;
}

export function Navigation({ currentUser, onLogout }: NavigationProps) {
  const location = useLocation();

  const isUserAdmin = currentUser && currentUser.role?.toUpperCase() === 'ADMIN';
  const isUserJudge = currentUser && (currentUser.role?.toUpperCase() === 'JUDGE' || isUserAdmin);
  const isParticipant = currentUser && currentUser.role?.toUpperCase() === 'PARTICIPANT';

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/events', icon: Calendar, label: 'Sự kiện' },
    { path: '/teams', icon: Users, label: 'Đội thi' },
    { path: '/leaderboard', icon: Award, label: 'Bảng xếp hạng' },
    ...(isParticipant ? [{ path: '/submit', icon: Upload, label: 'Nộp dự án' }] : []),
    ...(isUserJudge ? [{ path: '/judging', icon: CheckSquare, label: 'Chấm điểm' }] : []),
    ...(isUserAdmin ? [{ path: '/admin', icon: Settings, label: 'Quản lý' }] : []),
  ];

  // Lấy chữ cái đầu của Username để hiển thị Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.trim().split(' ').pop()?.charAt(0).toUpperCase() || 'U';
  };

  // Trả về nhãn vai trò có định dạng đẹp mắt
  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">BTC</span>;
      case 'JUDGE':
        return <span className="px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">Giám khảo</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">Thí sinh</span>;
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Bên trái: Logo thương hiệu */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Trophy className="text-blue-600 animate-pulse" size={32} />
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bên phải: Thông tin User đăng nhập hoặc Cụm nút Đăng nhập / Đăng ký */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                {/* Thông tin cá nhân */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800 leading-tight">
                    {currentUser.username}
                  </span>
                  <span className="mt-0.5">
                    {getRoleBadge(currentUser.role)}
                  </span>
                </div>

                {/* Chuông thông báo */}
                <NotificationBell currentUser={currentUser} />

                {/* Avatar tròn (Click để vào Profile) */}
                <Link to="/profile" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:scale-105 transition-transform" title="Hồ sơ cá nhân">
                  {getInitials(currentUser.username)}
                </Link>

                {/* Nút Đăng xuất */}
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
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
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}