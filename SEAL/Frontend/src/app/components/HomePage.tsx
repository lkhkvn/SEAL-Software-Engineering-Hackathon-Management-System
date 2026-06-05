import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Rocket, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/index.php/api/hackathons');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setEvents(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingEvents = events
    .filter(e => e.status === 'UPCOMING' || e.status === 'Sắp diễn ra')
    .slice(0, 3); // Lấy tối đa 3 sự kiện mới nhất

  const stats = [
    { icon: Calendar, label: 'Sự kiện trên hệ thống', value: events.length.toString() },
    { icon: Users, label: 'Đội thi đăng ký', value: 'Chưa có' },
    { icon: Trophy, label: 'Giải thưởng', value: 'Hấp dẫn' },
  ];

  const formatDateRange = (startStr: string | null, endStr: string | null) => {
    if (!startStr) return 'Chưa xác định';
    try {
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : null;
      
      const formatDigit = (n: number) => n < 10 ? `0${n}` : n;
      
      const startDay = formatDigit(start.getDate());
      const startMonth = formatDigit(start.getMonth() + 1);
      const startYear = start.getFullYear();
      
      if (end) {
        const endDay = formatDigit(end.getDate());
        const endMonth = formatDigit(end.getMonth() + 1);
        const endYear = end.getFullYear();
        
        if (startMonth === endMonth && startYear === endYear) {
          return `${startDay}-${endDay}/${startMonth}/${startYear}`;
        }
        return `${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
      }
      return `${startDay}/${startMonth}/${startYear}`;
    } catch (e) {
      return 'Lỗi ngày tháng';
    }
  };

  const features = [
    {
      icon: Rocket,
      title: 'Dễ dàng tổ chức',
      description: 'Quản lý mọi khía cạnh của hackathon từ đăng ký đến kết quả',
    },
    {
      icon: Target,
      title: 'Chấm điểm công bằng',
      description: 'Hệ thống chấm điểm minh bạch và công bằng cho mọi đội thi',
    },
    {
      icon: Zap,
      title: 'Trải nghiệm mượt mà',
      description: 'Giao diện thân thiện, dễ sử dụng cho cả BTC và thí sinh',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Hệ thống Quản lý Hackathon
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Nền tảng toàn diện cho việc tổ chức, quản lý và tham gia các cuộc thi lập trình sáng tạo
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/events"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Xem sự kiện
              </Link>
              <Link
                to="/admin"
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white/30"
              >
                Tạo sự kiện mới
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  <Icon className="mb-3" size={32} />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sự kiện sắp diễn ra</h2>
          <p className="text-gray-600">Đăng ký ngay để không bỏ lỡ cơ hội tham gia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div
                className="h-40 flex items-center justify-center text-white text-xl font-bold text-center p-4"
                style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
              >
                {event.name}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Sắp diễn ra
                  </span>
                </div>
                <div className="space-y-2 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="text-sm">{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="text-sm">0/{event.maxTeams || '∞'} đội đã đăng ký</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy size={16} />
                    <span className="text-sm">Nhiều giải thưởng hấp dẫn</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Xem chi tiết
                </button>
              </div>
            </Link>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
              Hiện chưa có sự kiện nào sắp diễn ra.
            </div>
          )}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn SEAL?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-4">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
