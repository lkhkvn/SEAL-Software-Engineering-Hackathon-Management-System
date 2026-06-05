import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:8000/index.php/api/contests');
        const result = await res.json();
        
        if (result.status === 'success' && result.data) {
          // Màu nền ngẫu nhiên cho thẻ
          const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
          ];
          
          // Chuyển đổi trạng thái từ EN (DB) sang VN (UI)
          const mapStatus = (statusStr: string) => {
            switch(statusStr) {
              case 'ACTIVE': return 'Đang mở đăng ký';
              case 'UPCOMING': return 'Sắp mở đăng ký';
              case 'COMPLETED': return 'Đã kết thúc';
              default: return 'Đang mở đăng ký';
            }
          };

          // Ánh xạ dữ liệu trả về từ DB sang format giao diện cần
          const mappedEvents = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            date: `${new Date(item.start_date).toLocaleDateString('vi-VN')} - ${new Date(item.end_date).toLocaleDateString('vi-VN')}`,
            location: item.location,
            teams: Math.floor(Math.random() * (item.max_teams / 2)), // Dữ liệu giả lập cho số đội đã tham gia
            maxTeams: item.max_teams,
            prize: item.prize || ('₫' + (item.max_teams * 1000000).toLocaleString('vi-VN')), // Lấy từ DB hoặc giả lập nếu thiếu
            status: mapStatus(item.status),
            category: item.category,
            image: item.image || gradients[item.id % gradients.length], // Lấy từ DB hoặc dùng gradient mặc định
            description: item.description
          }));
          
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu sự kiện:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors: Record<string, string> = {
    'Đang mở đăng ký': 'bg-green-100 text-green-700',
    'Sắp mở đăng ký': 'bg-blue-100 text-blue-700',
    'Đang diễn ra': 'bg-orange-100 text-orange-700',
    'Đã kết thúc': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh sách sự kiện</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang mở đăng ký">Đang mở đăng ký</option>
                <option value="Sắp mở đăng ký">Sắp mở đăng ký</option>
                <option value="Đang diễn ra">Đang diễn ra</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-blue-300"
            >
              <div
                className="h-40 flex items-center justify-center text-white text-xl font-bold p-6 text-center"
                style={{ background: event.image }}
              >
                {event.name}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {event.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{event.description}</p>

                <div className="space-y-2 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{event.teams}/{event.maxTeams} đội</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(event.teams / event.maxTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={16} />
                    <span className="font-semibold text-gray-900">{event.prize}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy sự kiện nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
