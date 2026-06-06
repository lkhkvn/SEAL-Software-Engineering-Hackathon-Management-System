import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Copy,
  Check,
  Sparkles,
  X,
} from 'lucide-react';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [eventData, setEventData] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái modal đăng ký
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerType, setRegisterType] = useState<'create' | 'join'>('create');
  const [registerTeamName, setRegisterTeamName] = useState('');
  const [registerJoinCode, setRegisterJoinCode] = useState('');
  const [submittingRegistration, setSubmittingRegistration] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successTeam, setSuccessTeam] = useState<{ name: string; joinCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Đọc thông tin user hiện tại từ localStorage
  const currentUser = (() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  })();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setSubmittingRegistration(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (registerType === 'create') {
        if (!registerTeamName.trim()) {
          throw new Error('Vui lòng nhập tên đội thi!');
        }

        const response = await fetch('http://localhost:8000/index.php/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: registerTeamName,
            category: eventData?.category || 'AI & ML'
          })
        });

        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Tạo đội thi thất bại.');
        }

        setSuccessTeam({
          name: result.data.teamName,
          joinCode: result.data.joinCode
        });
      } else {
        if (!registerJoinCode.trim()) {
          throw new Error('Vui lòng nhập mã tham gia!');
        }

        const response = await fetch('http://localhost:8000/index.php/api/teams/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            joinCode: registerJoinCode
          })
        });

        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Tham gia đội thi thất bại.');
        }

        setSuccessTeam({
          name: result.data.teamName,
          joinCode: result.data.joinCode
        });
      }
    } catch (err: any) {
      setRegisterError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmittingRegistration(false);
    }
  };

  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterTeamName('');
    setRegisterJoinCode('');
    setRegisterError(null);
    setSuccessTeam(null);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}`);
        const result = await res.json();
        if (!res.ok || result.status === 'error') throw new Error(result.message || 'Lỗi tải chi tiết cuộc thi');
        setEventData(result.data);

        // Tải danh sách mốc thời gian (milestones)
        try {
          const milestonesRes = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}/milestones`);
          const milestonesResult = await milestonesRes.json();
          if (milestonesRes.ok && milestonesResult.status === 'success') {
            setMilestones(milestonesResult.data || []);
          }
        } catch (mErr) {
          console.error("Lỗi tải milestones:", mErr);
        }

        // Tải danh sách lịch trình (schedules)
        try {
          const schedulesRes = await fetch(`http://localhost:8000/index.php/api/schedules?hackathonId=${id}`);
          const schedulesResult = await schedulesRes.json();
          if (schedulesRes.ok && schedulesResult.status === 'success') {
            setSchedules(schedulesResult.data || []);
          }
        } catch (sErr) {
          console.error("Lỗi tải schedules:", sErr);
        }
      } catch (e: any) {
        setError(e.message || 'Lỗi tải chi tiết cuộc thi');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
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

  // Custom parsers cho các trường text từ DB
  const parseCriteria = (text: string) => {
    if (!text) return [
      { name: 'Tính sáng tạo', weight: '30%', description: 'Ý tưởng đột phá và giải pháp mới mẻ' },
      { name: 'Khả năng ứng dụng', weight: '25%', description: 'Giá trị thực tiễn và tính khả thi của mô hình kinh doanh' },
      { name: 'Chất lượng kỹ thuật', weight: '25%', description: 'Độ hoàn thiện của code, kiến trúc hệ thống và công nghệ sử dụng' },
      { name: 'Kỹ năng thuyết trình', weight: '20%', description: 'Khả năng trình bày ý tưởng thuyết phục và demo sản phẩm tốt' },
    ];
    return text.split('\n').filter(s => s.trim()).map(line => {
      // Tìm mẫu "(Weight%)" nếu có
      const weightMatch = line.match(/\(([^)]+%)\)/);
      const weight = weightMatch ? weightMatch[1] : '';
      let cleanLine = line.replace(/\([^)]+%\)/, '').trim();
      const parts = cleanLine.split(/[:\-]/);
      return {
        name: parts[0].trim(),
        weight: weight,
        description: parts.slice(1).join(':').trim()
      };
    });
  };

  const parsePrizes = (text: string) => {
    if (!text) return [
      { rank: 'Giải Nhất', amount: '₫70,000,000', teams: 1 },
      { rank: 'Giải Nhì', amount: '₫40,000,000', teams: 1 },
      { rank: 'Giải Ba', amount: '₫25,000,000', teams: 1 },
      { rank: 'Giải Khuyến khích', amount: '₫5,000,000', teams: 3 },
    ];
    return text.split('\n').filter(s => s.trim()).map(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        return { rank: parts[0].trim(), amount: parts.slice(1).join(':').trim(), teams: 1 };
      }
      return { rank: 'Giải thưởng', amount: line.trim(), teams: 1 };
    });
  };

  const parseRules = (text: string) => {
    if (!text) return [
      'Mỗi đội từ 3-5 thành viên',
      'Sử dụng công nghệ AI/ML là bắt buộc',
      'Sản phẩm phải là ứng dụng mới, không được sử dụng dự án cũ',
      'Code phải được push lên GitHub công khai',
      'Tuân thủ quy định về bản quyền và đạo đức',
    ];
    return text.split('\n').filter(s => s.trim());
  };

  const parseScheduleText = (text: string) => {
    return text.split('\n').filter(s => s.trim()).map(line => {
      const parts = line.split(/[:\-](.+)/);
      return {
        time: parts[0] ? parts[0].trim() : '',
        event: parts[1] ? parts[1].trim() : line.trim(),
        location: 'Online'
      };
    });
  };

  const event = {
    id: eventData.id,
    name: eventData.name,
    date: (eventData.start_date && eventData.end_date)
      ? `${eventData.start_date.slice(0, 10)} → ${eventData.end_date.slice(0, 10)}`
      : ((eventData.startDate && eventData.endDate) 
        ? `${eventData.startDate.slice(0, 10)} → ${eventData.endDate.slice(0, 10)}` 
        : 'Chưa cập nhật'),
    location: eventData.location || 'Chưa cập nhật',
    teams: 12, // Số lượng đội mẫu của cuộc thi
    maxTeams: eventData.max_teams || eventData.maxTeams || 50,
    prize: eventData.prize || 'Cơ cấu giải thưởng hấp dẫn',
    status: eventData.status === 'ACTIVE' 
      ? 'Đang diễn ra' 
      : eventData.status === 'UPCOMING' 
      ? 'Sắp diễn ra' 
      : eventData.status === 'COMPLETED' 
      ? 'Đã kết thúc' 
      : 'Đã huỷ',
    category: eventData.category,
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: eventData.description || 'Chưa có mô tả',
    organizer: eventData.organizer || 'Bộ Khoa học và Công nghệ',
    registrationDeadline: eventData.registration_deadline ? eventData.registration_deadline.slice(0, 10) : 'Chưa cập nhật',
    
    // Parse Prizes
    prizes: parsePrizes(eventData.prize_details || eventData.prizeDetails),
    
    // Parse Schedule
    schedule: schedules.length > 0
      ? schedules.map((item: any) => {
          const startStr = item.startTime ? new Date(item.startTime).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '';
          const endStr = item.endTime ? ' - ' + new Date(item.endTime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '';
          return {
            time: `${startStr}${endStr}`,
            event: item.title,
            description: item.description,
            location: item.location || 'Online'
          };
        })
      : (eventData.schedule ? parseScheduleText(eventData.schedule) : [
          { time: '15/06 - 08:00', event: 'Check-in và đăng ký', location: 'Sảnh chính' },
          { time: '15/06 - 09:00', event: 'Lễ khai mạc', location: 'Hội trường A' },
          { time: '15/06 - 10:00', event: 'Bắt đầu thi đấu', location: 'Khu vực làm việc' },
          { time: '15/06 - 12:00', event: 'Nghỉ trưa', location: 'Nhà ăn tầng 2' },
          { time: '16/06 - 14:00', event: 'Checkpoint 1 - Demo tiến độ', location: 'Hội trường B' },
          { time: '17/06 - 10:00', event: 'Nộp sản phẩm cuối cùng', location: 'Online' },
          { time: '17/06 - 14:00', event: 'Thuyết trình trước BGK', location: 'Hội trường A' },
          { time: '17/06 - 17:00', event: 'Lễ trao giải', location: 'Hội trường A' },
        ]),
    criteria: parseCriteria(eventData.criteria),
    rules: parseRules(eventData.rules),
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
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0 animate-pulse">
                            {index + 1}
                          </div>
                          {index < event.schedule.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8 text-left">
                          <div className="font-semibold text-blue-600 mb-1">{item.time}</div>
                          <div className="font-medium text-gray-900 mb-1">{item.event}</div>
                          {(item as any).description && (
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">{(item as any).description}</p>
                          )}
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
                  <div className="space-y-6 text-left">
                    {/* Thể lệ cuộc thi */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        Quy định chung
                      </h3>
                      <div className="space-y-3">
                        {event.rules.map((rule, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5 shadow-sm">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{rule}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mốc thời gian quan trọng */}
                    {milestones.length > 0 && (
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="text-blue-600" size={20} />
                          Mốc thời gian quan trọng (Timeline)
                        </h3>
                        <div className="space-y-4">
                          {milestones.map((milestone: any, index: number) => (
                            <div key={milestone.id || index} className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow transition-shadow">
                              <div>
                                <h4 className="font-bold text-gray-950">{milestone.name}</h4>
                                {milestone.description && (
                                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{milestone.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs bg-blue-50 px-3.5 py-2 rounded-full self-start sm:self-center border border-blue-100">
                                <Clock size={14} />
                                <span>
                                  {milestone.dueDate ? new Date(milestone.dueDate).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Chưa cập nhật'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

              <button
                onClick={() => setShowRegisterModal(true)}
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đăng ký ngay
              </button>

              <button className="block w-full py-3 mt-3 bg-gray-100 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Lưu sự kiện
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đăng ký Tham gia */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 p-6 relative">
            
            {/* Nút đóng */}
            <button 
              onClick={handleCloseRegisterModal}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {!currentUser ? (
              // Case: Chưa đăng nhập
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Bạn cần đăng nhập bằng tài khoản Thí sinh để đăng ký tham gia cuộc thi này.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleCloseRegisterModal();
                      navigate('/login');
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                  <button
                    onClick={handleCloseRegisterModal}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : successTeam ? (
              // Case: Đăng ký thành công
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chúc mừng bạn đã đăng ký tham gia cuộc thi **{event.name}** thành công.
                </p>

                <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 my-5">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    Đội của bạn
                  </div>
                  <div className="font-bold text-gray-800 text-lg mb-3">
                    {successTeam.name}
                  </div>
                  
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                    Mã Code Tham gia (Join Code)
                  </div>
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xl tracking-widest font-extrabold py-2.5 px-4 rounded-lg">
                    <span>{successTeam.joinCode}</span>
                    <button
                      onClick={() => handleCopyCode(successTeam.joinCode)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600 cursor-pointer"
                      title="Sao chép mã"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-6 px-4">
                  Hãy gửi mã code này cho đồng đội của bạn để họ có thể nhập mã tham gia chung đội trên trang danh sách đội thi!
                </p>

                <button
                  onClick={() => {
                    handleCloseRegisterModal();
                    navigate('/teams');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  Xem danh sách đội thi
                </button>
              </div>
            ) : (
              // Case: Đang điền form đăng ký
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 text-left">
                  <Users className="text-blue-600" size={22} />
                  Đăng ký tham gia
                </h3>

                <p className="text-xs text-gray-500 mb-4 text-left">
                  Cuộc thi: <span className="font-semibold text-gray-700">{event.name}</span>
                </p>

                {/* Tab selector */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
                  <button
                    onClick={() => {
                      setRegisterType('create');
                      setRegisterError(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      registerType === 'create'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tạo đội thi mới
                  </button>
                  <button
                    onClick={() => {
                      setRegisterType('join');
                      setRegisterError(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      registerType === 'join'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tham gia đội hiện có
                  </button>
                </div>

                {registerError && (
                  <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-left">
                    {registerError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                  {registerType === 'create' ? (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tên đội thi mới của bạn
                      </label>
                      <input
                        type="text"
                        required
                        value={registerTeamName}
                        onChange={(e) => setRegisterTeamName(e.target.value)}
                        placeholder="Ví dụ: AI Innovators"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Danh mục đăng ký sẽ tự động áp dụng: <strong>{event.category}</strong>
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mã Join Code của đội bạn muốn tham gia
                      </label>
                      <input
                        type="text"
                        required
                        value={registerJoinCode}
                        onChange={(e) => setRegisterJoinCode(e.target.value)}
                        placeholder="Ví dụ: AI123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-widest text-center bg-white"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingRegistration}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submittingRegistration && <Loader2 className="animate-spin" size={16} />}
                      <span>
                        {submittingRegistration
                          ? 'Đang đăng ký...'
                          : registerType === 'create'
                          ? 'Tạo đội & Tham gia'
                          : 'Xác nhận tham gia'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseRegisterModal}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
