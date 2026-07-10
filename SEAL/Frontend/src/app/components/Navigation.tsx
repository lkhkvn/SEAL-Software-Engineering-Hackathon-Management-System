import { Link, useLocation } from 'react-router-dom';
import { Trophy, Calendar, Users, Settings, Home, Award, LogIn, LogOut, Upload, CheckSquare, HelpCircle, Building2, BookOpen } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
interface NavigationProps {
  currentUser: any;
  onLogout: () => void;
}

export function Navigation({ currentUser, onLogout }: NavigationProps) {
  const location = useLocation();

  const isUserAdmin = currentUser && currentUser.role?.toUpperCase() === 'ADMIN';
  const isUserJudge = currentUser && (currentUser.role?.toUpperCase() === 'JUDGE' || isUserAdmin);
  const isUserMentor = currentUser && (currentUser.role?.toUpperCase() === 'MENTOR' || isUserAdmin);
  const isParticipant = currentUser && currentUser.role?.toUpperCase() === 'PARTICIPANT';

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/events', icon: Calendar, label: 'Sự kiện' },
    { path: '/organizations', icon: Building2, label: 'Tổ chức' },
    { path: '/blog', icon: BookOpen, label: 'Blog' },
    ...(isParticipant ? [{ path: '/teams', icon: Users, label: 'Đội của tôi' }] : []),
    ...(isUserJudge && !isUserAdmin ? [{ path: '/judging', icon: CheckSquare, label: 'Chấm điểm' }] : []),
    ...(isUserMentor ? [{ path: '/mentor', icon: HelpCircle, label: 'Mentor' }] : []),
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
        return <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 rounded-full shadow-sm">Admin</span>;
      case 'JUDGE':
        return <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-purple-600 bg-purple-50 border border-purple-200 rounded-full shadow-sm">Giám khảo</span>;
      case 'MENTOR':
        return <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-full shadow-sm">Mentor</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full shadow-sm">Thí sinh</span>;
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Bên trái: Logo thương hiệu */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-md">
                <Trophy className="text-white animate-pulse" size={24} />
              </div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">SEAL</span>
            </Link>
          </div>

          {/* Ở giữa: Menu điều hướng chính */}
          <div className="flex items-center gap-0.5 mx-4 overflow-x-auto hide-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm font-semibold whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="inline lg:hidden">{item.label}</span>
                </Link>
              );
            })}
          </div>
          {/* Reserved for multi_replace chunk logic - this part was merged above */}

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
                <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-all ring-2 ring-white ring-offset-1" title="Hồ sơ cá nhân">
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