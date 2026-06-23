import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Rocket, Target, Zap, ChevronRight, Star, Activity, Code, ShieldCheck, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [teamsCount, setTeamsCount] = useState<number>(0);

  useEffect(() => {
    fetchEvents();
    fetchTeams();
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

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:8000/index.php/api/teams');
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setTeamsCount(result.data?.length || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeEvents = events.filter(e => e.status === 'ACTIVE' || e.status === 'Đang diễn ra');
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING' || e.status === 'Sắp diễn ra').slice(0, 3);
  const completedEventsCount = events.filter(e => e.status === 'COMPLETED' || e.status === 'Đã kết thúc').length;

  const stats = [
    { icon: Calendar, label: 'Sự kiện trên hệ thống', value: events.length.toString() },
    { icon: Users, label: 'Đội thi đăng ký', value: teamsCount > 0 ? teamsCount.toString() : 'Đang cập nhật' },
    { icon: Trophy, label: 'Dự án hoàn thành', value: (completedEventsCount * 15).toString() + '+' }, // Giả lập số dự án
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
      icon: Code,
      title: 'Môi trường sáng tạo',
      description: 'Nơi hội tụ các tài năng đam mê công nghệ, tự do phát triển ý tưởng đột phá.',
    },
    {
      icon: Target,
      title: 'Hệ thống chấm điểm chuẩn',
      description: 'Tiêu chí rõ ràng, minh bạch với ban giám khảo chuyên môn cao từ ngành.',
    },
    {
      icon: Zap,
      title: 'Trải nghiệm mượt mà',
      description: 'Giao diện trực quan, dễ dàng theo dõi tiến độ và nộp bài thi nhanh chóng.',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo mật & Đáng tin cậy',
      description: 'Dữ liệu dự án và thông tin cá nhân của đội thi được bảo mật tuyệt đối.',
    }
  ];

  const partners = [
    'Microsoft', 'Google', 'AWS', 'FPT Software', 'VNG', 'Momo'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white pb-32">
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 lg:pt-40 lg:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer shadow-lg shadow-black/20">
              <Star className="text-yellow-400 animate-pulse" size={16} fill="currentColor" />
              <span className="text-sm font-medium tracking-wide text-blue-50">Nền tảng Quản lý Hackathon Chuyên Nghiệp</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              Kiến tạo tương lai qua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">Từng Dòng Code</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
              Khám phá, tranh tài và tỏa sáng tại các cuộc thi lập trình lớn nhất. Quản lý toàn bộ vòng đời của một Hackathon một cách dễ dàng và minh bạch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 group hover:-translate-y-1"
              >
                Khám phá Sự kiện
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/admin"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-1 shadow-xl shadow-black/20"
              >
                Tổ chức Hackathon
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section Overlapping */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 mb-16">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-900/10 p-2 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 border border-white/40 ring-1 ring-slate-900/5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-5 p-6 rounded-2xl hover:bg-indigo-50/50 transition-colors group cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <Icon className="text-indigo-600" size={32} />
                </div>
                <div>
                  <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">{stat.value}</div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Events Section */}
      {activeEvents.length > 0 && (
        <div className="bg-gray-50 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                  </span>
                  Đang diễn ra
                </h2>
                <p className="text-gray-500 mt-2">Các cuộc thi đang trong thời gian nộp bài và tranh tài</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-green-100 hover:border-green-300 flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center p-6 text-center">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    <h3 className="text-2xl font-bold text-white relative z-10 line-clamp-3">{event.name}</h3>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                      <PlayCircle size={14} /> LIVE
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {event.category || 'Công nghệ'}
                      </span>
                    </div>
                    <div className="space-y-3 text-gray-600 mb-6 flex-1">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 text-gray-400" size={18} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Thời gian diễn ra</p>
                          <p className="text-sm">{formatDateRange(event.startDate, event.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="text-gray-400" size={18} />
                        <span className="text-sm font-medium">{event.maxTeams ? `Tối đa ${event.maxTeams} đội` : 'Không giới hạn số đội'}</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white rounded-xl font-bold transition-colors cursor-pointer">
                      Tham gia ngay
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sự kiện Sắp tới</h2>
            <p className="text-gray-500">Chuẩn bị sẵn sàng cho những thử thách mới</p>
          </div>
          <Link to="/events" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
            Xem tất cả sự kiện <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:-translate-y-1"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-80"></div>
                <h3 className="text-xl font-bold text-slate-800 relative z-10">{event.name}</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Sắp diễn ra
                  </span>
                </div>
                <div className="space-y-3 text-gray-600 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={18} />
                    <span className="text-sm font-medium">{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="text-gray-400" size={18} />
                    <span className="text-sm font-medium">Giải thưởng hấp dẫn</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-1 text-sm">
                    Tìm hiểu thêm <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Chưa có sự kiện nào sắp tới</h3>
              <p className="mt-1 text-gray-500">Ban tổ chức đang chuẩn bị cho các Hackathon tiếp theo. Hãy quay lại sau nhé!</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tại sao chọn Nền tảng SEAL?</h2>
            <p className="text-slate-400 text-lg">
              Chúng tôi cung cấp bộ công cụ mạnh mẽ và tối ưu nhất để bạn có thể tập trung hoàn toàn vào việc sáng tạo ra những sản phẩm công nghệ tuyệt vời.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/20 text-blue-400 rounded-xl mb-6">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sponsors/Partners Section */}
      <div className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            Được tin tưởng & đồng hành bởi các đối tác công nghệ
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {partners.map((partner, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-slate-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">SEAL</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 SEAL Hackathon Management System. Tự hào đồng hành cùng lập trình viên.
          </p>
        </div>
      </footer>
    </div>
  );
}
