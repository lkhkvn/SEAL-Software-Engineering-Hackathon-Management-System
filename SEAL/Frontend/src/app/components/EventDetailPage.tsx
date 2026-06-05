import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Info,
  CheckCircle,
  Award,
  FileText,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:8000/index.php/api/contests/${id}`);
        const result = await res.json();
        if (!res.ok || result.status === 'error') throw new Error(result.message);
        setEventData(result.data);
      } catch (e: any) {
        setError(e.message || 'Lỗi tải chi tiết cuộc thi');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
        <span className="text-gray-500 font-medium text-lg">Đang tải thông tin cuộc thi...</span>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="text-red-500 text-6xl font-bold mb-2">404</div>
        <span className="text-gray-700 font-medium text-lg">{error || 'Không tìm thấy cuộc thi'}</span>
        <Link to="/events" className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Parse data for UI display
  const event = {
    id: eventData.id,
    name: eventData.name,
    date: `${eventData.start_date?.slice(0,10)} → ${eventData.end_date?.slice(0,10)}`,
    location: eventData.location || 'Chưa cập nhật',
    teams: 124, // Fake for now as no teams registered table counts
    maxTeams: eventData.max_teams || 50,
    prize: eventData.prize || 'Chưa công bố',
    status: eventData.status === 'ACTIVE' ? 'Đang diễn ra' : eventData.status === 'UPCOMING' ? 'Sắp diễn ra' : eventData.status === 'COMPLETED' ? 'Đã kết thúc' : 'Đã huỷ',
    category: eventData.category,
    image: eventData.image || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: eventData.description || 'Chưa có mô tả',
    organizer: 'Bộ Khoa học và Công nghệ', // Hardcoded as requested to keep UI identical if not in DB
    registrationDeadline: eventData.start_date?.slice(0,10) || 'Chưa cập nhật',
    
    // Parse Prizes
    prizes: eventData.prize_details 
      ? eventData.prize_details.split('\n').filter((p: string) => p.trim() !== '').map((p: string) => {
          const parts = p.split(':');
          return {
            rank: parts[0]?.trim() || 'Giải',
            amount: parts[1]?.trim() || '',
            teams: 1
          };
        })
      : [
          { rank: 'Giải Nhất', amount: '₫70,000,000', teams: 1 },
          { rank: 'Giải Nhì', amount: '₫40,000,000', teams: 1 },
          { rank: 'Giải Ba', amount: '₫25,000,000', teams: 1 },
          { rank: 'Giải Khuyến khích', amount: '₫5,000,000', teams: 3 },
        ],
    
    // Parse Schedule
    schedule: eventData.schedule
      ? eventData.schedule.split('\n').filter((s: string) => s.trim() !== '').map((s: string) => {
          let parts = s.split('|').map((x: string) => x.trim());
          if (parts.length === 1) parts = s.split('-').map((x: string) => x.trim());
          return {
            time: parts[0] || '',
            event: parts.length > 1 ? parts[1] : s,
            location: parts.length > 2 ? parts[2] : ''
          };
        })
      : [
          { time: '15/06 - 08:00', event: 'Check-in và đăng ký', location: 'Sảnh chính' },
          { time: '15/06 - 09:00', event: 'Lễ khai mạc', location: 'Hội trường A' },
          { time: '15/06 - 10:00', event: 'Bắt đầu thi đấu', location: 'Khu vực làm việc' },
          { time: '15/06 - 12:00', event: 'Nghỉ trưa', location: 'Nhà ăn tầng 2' },
          { time: '16/06 - 14:00', event: 'Checkpoint 1 - Demo tiến độ', location: 'Hội trường B' },
          { time: '17/06 - 10:00', event: 'Nộp sản phẩm cuối cùng', location: 'Online' },
          { time: '17/06 - 14:00', event: 'Thuyết trình trước BGK', location: 'Hội trường A' },
          { time: '17/06 - 17:00', event: 'Lễ trao giải', location: 'Hội trường A' },
        ],
    
    // Hardcoded criteria to keep UI pretty since DB has no criteria column yet
    criteria: [
      { name: 'Tính sáng tạo', weight: '30%', description: 'Ý tưởng độc đáo và sáng tạo' },
      { name: 'Tính khả thi', weight: '25%', description: 'Khả năng triển khai thực tế' },
      { name: 'Kỹ thuật', weight: '25%', description: 'Chất lượng code và kiến trúc' },
      { name: 'Trình bày', weight: '20%', description: 'Cách thuyết trình và demo' },
    ],
    
    // Parse Rules
    rules: eventData.rules
      ? eventData.rules.split('\n').filter((r: string) => r.trim() !== '')
      : [
          'Mỗi đội từ 3-5 thành viên',
          'Sử dụng công nghệ AI/ML là bắt buộc',
          'Sản phẩm phải là ứng dụng mới, không được sử dụng dự án cũ',
          'Code phải được push lên GitHub công khai',
          'Tuân thủ quy định về bản quyền và đạo đức',
        ],
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Info },
    { id: 'schedule', label: 'Lịch trình', icon: Clock },
    { id: 'prizes', label: 'Giải thưởng', icon: Trophy },
    { id: 'rules', label: 'Thể lệ', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-64 flex items-center justify-center text-white"
        style={{ background: event.image }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại danh sách</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-xl text-white/90">{event.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin chung</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="text-blue-600 mt-1" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">Thời gian</div>
                            <div className="font-medium text-gray-900">{event.date}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="text-blue-600 mt-1" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">Địa điểm</div>
                            <div className="font-medium text-gray-900">{event.location}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="text-blue-600 mt-1" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">Số đội tham gia</div>
                            <div className="font-medium text-gray-900">
                              {event.teams}/{event.maxTeams} đội
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Trophy className="text-blue-600 mt-1" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">Tổng giải thưởng</div>
                            <div className="font-medium text-gray-900">{event.prize}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiêu chí đánh giá</h3>
                      <div className="space-y-3">
                        {event.criteria.map((criterion, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="text-green-600 mt-1" size={20} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{criterion.name}</span>
                                <span className="text-sm font-semibold text-blue-600">
                                  {criterion.weight}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{criterion.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="space-y-4">
                    {event.schedule.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          {index < event.schedule.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="font-semibold text-blue-600 mb-1">{item.time}</div>
                          <div className="font-medium text-gray-900 mb-1">{item.event}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin size={14} />
                            {item.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'prizes' && (
                  <div className="space-y-4">
                    {event.prizes.map((prize, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-center gap-4">
                          <Award
                            className={index === 0 ? 'text-yellow-500' : 'text-orange-500'}
                            size={32}
                          />
                          <div>
                            <div className="font-bold text-gray-900">{prize.rank}</div>
                            <div className="text-sm text-gray-600">
                              {prize.teams} đội
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{prize.amount}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="space-y-3">
                    {event.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{rule}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
              <div className="mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {event.status}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ban tổ chức</div>
                  <div className="font-medium text-gray-900">{event.organizer}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Hạn đăng ký</div>
                  <div className="font-medium text-gray-900">{event.registrationDeadline}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">Số lượng đội</div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(event.teams / event.maxTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {event.teams}/{event.maxTeams} đội đã đăng ký
                  </div>
                </div>
              </div>

              <Link
                to={`/events/${event.id}/register`}
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Đăng ký ngay
              </Link>

              <button className="block w-full py-3 mt-3 bg-gray-100 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Lưu sự kiện
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
