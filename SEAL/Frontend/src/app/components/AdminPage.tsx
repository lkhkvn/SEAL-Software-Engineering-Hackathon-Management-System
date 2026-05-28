import { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  BarChart3, 
  Settings as SettingsIcon, 
  Eye, 
  Search, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

interface AdminPageProps {
  currentUser: any;
}

export function AdminPage({ currentUser }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Trạng thái quản lý phân quyền (tab Permissions)
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Kiểm tra quyền Admin
  const isAdmin = currentUser && currentUser.role?.toUpperCase() === 'ADMIN';

  // Lấy danh sách thành viên khi vào tab Phân quyền
  useEffect(() => {
    if (activeTab === 'permissions' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/index.php/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Không thể lấy danh sách người dùng.');
      }
      setUsers(result.data || []);
    } catch (err: any) {
      setUserError(err.message || 'Lỗi kết nối API Backend.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/index.php/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Cập nhật vai trò thất bại.');
      }
      
      // Cập nhật state cục bộ
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showNotification('success', `Cập nhật vai trò thành công cho ${result.data.username}!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Không thể cập nhật vai trò.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Trả về giao diện báo lỗi nếu không có quyền truy cập
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="text-red-500 font-bold text-6xl mb-4">403</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang quản trị này. Trang này chỉ dành cho Ban tổ chức (ADMIN).
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Tổng sự kiện', value: '24', change: '+3', icon: Calendar, color: 'blue' },
    { label: 'Đội thi đăng ký', value: '856', change: '+127', icon: Users, color: 'green' },
    { label: 'Sự kiện đang diễn ra', value: '5', change: '+2', icon: Trophy, color: 'purple' },
    { label: 'Tổng giải thưởng', value: '₫2.5B', change: '+₫500M', icon: BarChart3, color: 'orange' },
  ];

  const recentEvents = [
    { id: 1, name: 'AI Innovation Hackathon 2026', status: 'active', teams: 124, date: '15-17/06/2026' },
    { id: 2, name: 'FinTech Challenge', status: 'active', teams: 89, date: '22-24/06/2026' },
    { id: 3, name: 'Green Tech Hackathon', status: 'upcoming', teams: 67, date: '01-03/07/2026' },
    { id: 4, name: 'Healthcare Innovation', status: 'active', teams: 156, date: '10-12/07/2026' },
    { id: 5, name: 'EdTech Summit', status: 'active', teams: 45, date: '20-22/07/2026' },
  ];

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    active: 'Đang diễn ra',
    upcoming: 'Sắp diễn ra',
    completed: 'Đã kết thúc',
  };

  // Lọc danh sách người dùng theo thanh tìm kiếm
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* Toast thông báo trôi (Notification Card) */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border bg-white max-w-sm">
          {notification.type === 'success' ? (
            <CheckCircle2 className="text-green-500 flex-shrink-0" size={22} />
          ) : (
            <AlertCircle className="text-red-500 flex-shrink-0" size={22} />
          )}
          <span className="text-sm font-medium text-gray-700">
            {notification.message}
          </span>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý hệ thống</h1>
              <p className="text-gray-500 mt-1">Tổng quan thông tin và kiểm soát vai trò các thành viên trong Hackathon</p>
            </div>
            <button
              onClick={() => setShowCreateEvent(!showCreateEvent)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-sm hover:scale-102"
            >
              <Plus size={18} />
              Tạo sự kiện mới
            </button>
          </div>

          <div className="flex gap-2">
            {['overview', 'events', 'permissions', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && 'Tổng quan'}
                {tab === 'events' && 'Quản lý sự kiện'}
                {tab === 'permissions' && 'Phân quyền'}
                {tab === 'settings' && 'Cài đặt'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCreateEvent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo sự kiện mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sự kiện
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên sự kiện"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                  <option>AI & ML</option>
                  <option>FinTech</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Blockchain</option>
                  <option>Sustainability</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm tổ chức"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số đội tối đa
                </label>
                <input
                  type="number"
                  placeholder="150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                rows={3}
                placeholder="Nhập mô tả chi tiết về sự kiện"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              ></textarea>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
                Tạo sự kiện
              </button>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"
                      >
                        <Icon size={24} />
                      </div>
                      <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Sự kiện gần đây</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Tên sự kiện
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Số đội
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 text-sm">{event.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusColors[event.status]
                            }`}
                          >
                            {statusLabels[event.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm font-medium">{event.teams} đội</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm">{event.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Xem chi tiết">
                              <Eye size={18} className="text-gray-500" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Cài đặt">
                              <SettingsIcon size={18} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý sự kiện</h2>
            <p className="text-gray-500">Tính năng quản lý chi tiết sự kiện đang được phát triển...</p>
          </div>
        )}

        {/* TAB PHÂN QUYỀN (ROLE PERMISSION MANAGEMENT) */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="text-blue-600" size={22} />
                    Danh sách & Phân quyền thành viên
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Thay đổi vai trò thành viên để cấp quyền quản lý (BTC), chấm thi (Giám khảo) hoặc tham gia (Thí sinh).
                  </p>
                </div>
                
                {/* Thanh tìm kiếm nhanh */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Phần hiển thị lỗi tải dữ liệu */}
              {userError && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Lỗi tải dữ liệu</h4>
                    <p className="text-xs text-red-700 mt-1">{userError}</p>
                    <button 
                      onClick={fetchUsers}
                      className="mt-2 text-xs font-semibold text-red-800 underline hover:text-red-900"
                    >
                      Thử tải lại
                    </button>
                  </div>
                </div>
              )}

              {/* Phần nội dung chính (Bảng danh sách) */}
              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="text-blue-600 animate-spin" size={38} />
                  <span className="text-sm text-gray-500 font-medium">Đang tải danh sách thành viên...</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                          ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Thành viên
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Vai trò hiện tại
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-56">
                          Phân quyền vai trò
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                              #{user.id}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                  {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">
                                  {user.username}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email}
                            </td>
                            <td className="px-6 py-4">
                              {user.role?.toUpperCase() === 'ADMIN' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  <Shield size={12} />
                                  BTC (ADMIN)
                                </span>
                              )}
                              {user.role?.toUpperCase() === 'JUDGE' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                  Giám khảo (JUDGE)
                                </span>
                              )}
                              {user.role?.toUpperCase() === 'PARTICIPANT' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                  Thí sinh (PARTICIPANT)
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {updatingUserId === user.id ? (
                                <div className="flex items-center justify-center gap-1.5 py-1 text-sm text-blue-600 font-semibold">
                                  <Loader2 className="animate-spin" size={16} />
                                  <span>Đang lưu...</span>
                                </div>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                                >
                                  <option value="PARTICIPANT">Thí sinh (PARTICIPANT)</option>
                                  <option value="JUDGE">Giám khảo (JUDGE)</option>
                                  <option value="ADMIN">Ban tổ chức (ADMIN)</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                            Không tìm thấy thành viên nào phù hợp với từ khóa tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt hệ thống</h2>
            <p className="text-gray-500">Tính năng cài đặt đang được phát triển...</p>
          </div>
        )}
      </div>
    </div>
  );
}
