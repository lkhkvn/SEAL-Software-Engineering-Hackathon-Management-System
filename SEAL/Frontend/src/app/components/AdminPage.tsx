import { useState } from 'react';
import { Plus, Calendar, Users, Trophy, BarChart3, Settings as SettingsIcon, Eye } from 'lucide-react';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý hệ thống</h1>
              <p className="text-gray-600 mt-1">Tổng quan và quản lý các sự kiện hackathon</p>
            </div>
            <button
              onClick={() => setShowCreateEvent(!showCreateEvent)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus size={20} />
              Tạo sự kiện mới
            </button>
          </div>

          <div className="flex gap-2">
            {['overview', 'events', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'overview' && 'Tổng quan'}
                {tab === 'events' && 'Quản lý sự kiện'}
                {tab === 'settings' && 'Cài đặt'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showCreateEvent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo sự kiện mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sự kiện
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên sự kiện"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm tổ chức"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số đội tối đa
                </label>
                <input
                  type="number"
                  placeholder="150"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                rows={3}
                placeholder="Nhập mô tả chi tiết về sự kiện"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Tạo sự kiện
              </button>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                      >
                        <Icon className={`text-${stat.color}-600`} size={24} />
                      </div>
                      <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Sự kiện gần đây</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Tên sự kiện
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Số đội
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Thời gian
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{event.name}</span>
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
                          <span className="text-gray-600">{event.teams} đội</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">{event.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye size={18} className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <SettingsIcon size={18} className="text-gray-600" />
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quản lý sự kiện</h2>
            <p className="text-gray-600">Tính năng quản lý chi tiết sự kiện đang được phát triển...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt hệ thống</h2>
            <p className="text-gray-600">Tính năng cài đặt đang được phát triển...</p>
          </div>
        )}
      </div>
    </div>
  );
}
