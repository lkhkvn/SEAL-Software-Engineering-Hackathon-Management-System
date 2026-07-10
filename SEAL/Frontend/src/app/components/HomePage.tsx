import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Rocket, Target, Zap, ChevronRight, Code, ShieldCheck, ArrowRight, PlayCircle, MapPin, Globe, Layout, Video, CheckSquare, Link as LinkIcon, Cpu, Lightbulb, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

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
        setTeams(result.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeEvents = events.filter(e => e.status === 'ACTIVE' || e.status === 'Đang diễn ra');
  const completedEventsCount = events.filter(e => e.status === 'COMPLETED' || e.status === 'Đã kết thúc').length;

  const formatDateRange = (startStr: string | null, endStr: string | null) => {
    if (!startStr) return 'Đang cập nhật';
    try {
      const start = new Date(startStr);
      const end = endStr ? new Date(endStr) : null;
      const format = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      
      if (end) {
        return `${format(start)} - ${format(end)}`;
      }
      return format(start);
    } catch (e) {
      return 'Đang cập nhật';
    }
  };

  const latestEvent = events.length > 0 ? events[0] : null;
  const participantCount = teams.reduce((sum, team) => sum + (team.members || 0), 0) || 0;
  const teamsCount = teams.length;
  const totalPrizePool = events.reduce((sum, event) => sum + (Number(event.prize_pool) || 0), 0);
  
  const formattedPrize = totalPrizePool > 0 
    ? (totalPrizePool >= 1000000000 ? `${(totalPrizePool / 1000000000).toFixed(1)} Tỷ` : `${(totalPrizePool / 1000000).toFixed(0)} Tr`) + ' VNĐ'
    : '$50k+';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#10B981]/30 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 border-b border-slate-200">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-300/40 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/40 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
            <Rocket className="text-[#10B981]" size={16} />
            <span className="text-sm font-medium text-slate-600">Nền tảng Quản lý Hackathon Toàn diện</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] max-w-4xl text-slate-900">
            Xây dựng dự án <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3B82F6]">
              đột phá tiếp theo của bạn
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl font-light leading-relaxed">
            Tham gia cùng hàng ngàn nhà phát triển, nhà thiết kế và nhà đổi mới. Khám phá các cuộc thi hackathon toàn cầu, thành lập đội ngũ và biến ý tưởng của bạn thành hiện thực.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/events"
              className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Khám phá Hackathons <ArrowRight size={20} />
            </Link>
            <Link
              to="/admin"
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              Tổ chức Hackathon
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{events.length}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Hackathons</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-[#10B981] mb-2">{participantCount}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Người tham gia</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2">{teamsCount}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Dự án</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-[#3B82F6] mb-2">{formattedPrize}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Giải thưởng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Features - Split Sections */}
      <div className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Section 1: Thiết lập dễ dàng */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#059669] text-sm font-bold">
                <Target size={16} /> Quản lý toàn diện
              </div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Thiết lập hackathon dễ dàng
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-light">
                Tối ưu hóa việc lập kế hoạch và thực hiện sự kiện của bạn với nền tảng quản lý hackathon của chúng tôi. 
                Tất cả các tính năng bạn cần để tổ chức một hackathon thành công như đăng ký người tham gia, ghép nhóm, 
                lịch trình sự kiện, trò chuyện nội bộ, và hơn thế nữa - đều có trong một công cụ duy nhất.
              </p>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                {/* Mock UI Dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-800">Bảng điều khiển</div>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex flex-col justify-center">
                      <Users className="text-blue-500 mb-2" size={20} />
                      <div className="text-2xl font-bold text-slate-800">{participantCount}</div>
                      <div className="text-xs text-slate-500 font-medium">Người đăng ký</div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex flex-col justify-center">
                      <CheckSquare className="text-emerald-500 mb-2" size={20} />
                      <div className="text-2xl font-bold text-slate-800">{teamsCount > 0 ? teamsCount : 342}</div>
                      <div className="text-xs text-slate-500 font-medium">Dự án đã nộp</div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <div className="text-sm font-semibold text-slate-700 mb-3">Lịch trình sắp tới</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-500 shadow-sm">
                          <Video size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">Lễ khai mạc</div>
                          <div className="text-xs text-slate-500">{latestEvent?.start_date ? new Date(latestEvent.start_date).toLocaleDateString('vi-VN') : 'Hôm nay, 19:00'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-500 shadow-sm">
                          <Code size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">Hạn chót nộp bài</div>
                          <div className="text-xs text-slate-500">{latestEvent?.end_date ? new Date(latestEvent.end_date).toLocaleDateString('vi-VN') : 'Chủ nhật, 23:59'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Trang tùy chỉnh */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-sm font-bold">
                <Layout size={16} /> Thương hiệu riêng
              </div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Trang hackathon tùy chỉnh
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed font-light">
                Tăng số lượng người tham gia với trang đích hoàn chỉnh và được tổ chức tốt. 
                Tùy chỉnh thương hiệu và tài sản của bạn với tất cả thông tin cần thiết cho 
                thử thách và quy trình đăng ký đơn giản.
              </p>
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white border border-slate-200 rounded-3xl p-2 overflow-hidden shadow-xl">
                {/* Mock UI Custom Page - Event Card Layout */}
                <div className="flex flex-col h-full bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 relative">
                  {/* Cover Image Section */}
                  <div className="relative h-[200px] w-full bg-gray-100">
                    <img 
                      src={latestEvent?.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60"}
                      alt={latestEvent?.name || "Hackathon"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-[#5027d9]/10 text-[#5027d9]">
                      Đang diễn ra
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="relative p-6 flex flex-col flex-1 pt-12">
                    <div className="absolute -top-10 left-6">
                      <div className="w-20 h-20 rounded-full border-[5px] border-white overflow-hidden bg-white shadow-sm flex items-center justify-center">
                        {latestEvent?.logo_url ? (
                          <img src={latestEvent.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Rocket className="text-[#5027d9]" size={32} />
                        )}
                      </div>
                    </div>

                    <div className="absolute top-4 right-6 flex items-center gap-4 text-gray-500 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-[#5027d9]">
                        <Users size={16} /> {participantCount}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lightbulb size={16} /> {teamsCount}
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-2 mb-3">
                      <h3 className="text-[22px] leading-tight font-bold text-gray-900 line-clamp-2 pr-2">
                        {latestEvent?.name || 'AI Innovation Hackathon 2024'}
                      </h3>
                      <button className="shrink-0 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                        Đăng ký
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {latestEvent?.description || 'Tham gia thử thách xây dựng các giải pháp AI đột phá. Tổng giải thưởng lên đến $50,000.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-[#5027d9] bg-[#5027d9]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Hexagon size={12}/> {latestEvent?.category || 'AI & Machine Learning'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Features */}
      <div className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">Đặc trưng</h2>
            <p className="text-slate-600 text-xl font-light">
              Khám phá thêm các tính năng. Tất cả các công cụ bạn cần, trong một nền tảng duy nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Đầu nối MCP gốc</h3>
              <p className="text-slate-600 leading-relaxed">
                Kết nối nền tảng trực tiếp với trợ lý AI của bạn và duyệt các bài đăng, bình chọn cho các dự án yêu thích và quản lý tất cả tin nhắn trực tiếp mà không cần mở tab mới.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-red-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video className="text-red-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Phát trực tiếp</h3>
              <p className="text-slate-600 leading-relaxed">
                Phát trực tiếp các sự kiện trên nền tảng, chẳng hạn như hội thảo trực tuyến, hỏi đáp hoặc bất kỳ loại trải nghiệm trực tiếp nào khác.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-green-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="text-green-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Bảng điều khiển nộp bài</h3>
              <p className="text-slate-600 leading-relaxed">
                Cho phép người tham gia nộp dự án của họ ở nhiều định dạng khác nhau, bao gồm hình ảnh, video và tệp đính kèm, trong một môi trường thân thiện.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-purple-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckSquare className="text-purple-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Hệ thống bỏ phiếu</h3>
              <p className="text-slate-600 leading-relaxed">
                Việc đánh giá các dự án tốt nhất chưa bao giờ đơn giản đến thế. Tất cả những gì bạn cần làm là xác định các tiêu chí phù hợp nhất với mục tiêu của mình và hãy để phần còn lại cho chúng tôi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-yellow-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Kết nối ứng dụng</h3>
              <p className="text-slate-600 leading-relaxed">
                Đừng lãng phí thời gian và công sức quản lý những việc có thể tự động hóa. Hãy đồng bộ hóa thông tin cuộc thi hackathon của bạn và tạo quy trình làm việc.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-teal-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-teal-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Đã kiểm toán & bảo mật</h3>
              <p className="text-slate-600 leading-relaxed">
                Đảm bảo an ninh là ưu tiên hàng đầu. Ứng dụng web đã được kiểm tra và phê duyệt nghiêm ngặt với độ an toàn cao nhất.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active/Upcoming Hackathons */}
      {activeEvents.length > 0 && (
        <div className="py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Hackathon Đang Diễn Ra</h2>
                <p className="text-slate-600 text-lg">Các cuộc thi hiện đang mở đăng ký và nhận bài dự thi</p>
              </div>
              <Link to="/events" className="hidden md:flex items-center gap-2 text-[#10B981] hover:text-[#059669] font-semibold transition-colors">
                Xem tất cả <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-[#10B981]/50 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col"
                >
                  <div className="h-56 relative overflow-hidden bg-slate-200">
                    <img 
                      src={`https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=400`} 
                      alt="Cover" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-emerald-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Đang diễn ra
                    </div>
                  </div>
                  
                  <div className="pt-6 p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#10B981] transition-colors">{event.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-auto border-t border-slate-200">
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Thời gian</p>
                        <p className="text-sm font-semibold flex items-center gap-1 text-slate-700"><Calendar size={14} className="text-slate-400"/> {formatDateRange(event.startDate, event.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-b from-white to-slate-100 py-24 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Bạn đã sẵn sàng?</h2>
          <p className="text-xl text-slate-600 mb-10">Tham gia cộng đồng những nhà sáng tạo và bắt đầu hành trình hackathon của bạn ngay hôm nay.</p>
          <Link
            to="/register"
            className="inline-flex px-8 py-4 bg-[#10B981] text-white hover:bg-[#059669] hover:-translate-y-1 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] items-center justify-center gap-2 text-lg"
          >
            Tạo tài khoản <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center shadow-sm">
              <Code className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">SEAL</span>
          </div>
          <div className="text-slate-500 text-sm font-medium">
            © 2026 Hệ thống Quản lý Hackathon SEAL. Đã đăng ký bản quyền.
          </div>
        </div>
      </footer>
    </div>
  );
}
