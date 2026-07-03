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
  UserCheck,
  Download,
  BookOpen,
  Lock
} from 'lucide-react';
import { LeaderboardPage } from './LeaderboardPage';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participants');
  const [eventData, setEventData] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [isTeamRegistered, setIsTeamRegistered] = useState(false);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Trạng thái đếm ngược (realtime)
  const [timeLeft, setTimeLeft] = useState('');
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Trạng thái modal đăng ký
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerType, setRegisterType] = useState<'create' | 'join' | 'existing'>('create');
  const [registerTeamName, setRegisterTeamName] = useState('');
  const [registerJoinCode, setRegisterJoinCode] = useState('');
  const [submittingRegistration, setSubmittingRegistration] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successTeam, setSuccessTeam] = useState<{ name: string; joinCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [myTeam, setMyTeam] = useState<{ id: number; name: string; joinCode: string; isLeader: boolean; memberCount: number; maxMembers: number } | null>(null);

  // Đọc thông tin user hiện tại từ localStorage
  const currentUser = (() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  })();

  const token = localStorage.getItem('auth_token');
  const API = 'http://localhost:8000/index.php/api';

  // Tải đội thi hiện tại của user qua API chính xác
  const fetchMyTeam = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/users/me/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.data) {
        const t = data.data;
        setMyTeam({
          id: t.id,
          name: t.name,
          joinCode: t.joinCode,
          isLeader: t.isLeader,
          memberCount: t.memberCount,
          maxMembers: t.maxMembers,
        });
      }
    } catch {}
  };

  const handleOpenRegisterModal = () => {
    setShowRegisterModal(true);
    setRegisterType('create'); // reset về create trước, sau khi fetchMyTeam xong sẽ auto-switch
    fetchMyTeam();
  };

  // Khi myTeam được load thành công, tự động chuyển sang tab "Đội của tôi"
  useEffect(() => {
    if (myTeam && showRegisterModal) {
      setRegisterType('existing');
    }
  }, [myTeam]);

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
      if (registerType === 'existing' && myTeam) {
        // Chỉ leader mới được đăng ký đội vào cuộc thi
        if (!myTeam.isLeader) throw new Error('Chỉ đội trưởng mới có quyền đăng ký đội vào cuộc thi!');
        const response = await fetch(`${API}/hackathons/${id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ team_id: myTeam.id }),
        });
        const result = await response.json();
        if (!response.ok || result.status === 'error') throw new Error(result.message);
        setSuccessTeam({ name: myTeam.name, joinCode: myTeam.joinCode });

      } else if (registerType === 'create') {
        if (!registerTeamName.trim()) throw new Error('Vui lòng nhập tên đội thi!');
        const response = await fetch(`${API}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: registerTeamName, category: eventData?.category || 'AI & ML' }),
        });
        const result = await response.json();
        if (!response.ok || result.status === 'error') throw new Error(result.message || 'Tạo đội thi thất bại.');
        // Sau khi tạo đội xong, đăng ký đội mới vào cuộc thi
        const newTeamId = result.data?.teamId;
        if (newTeamId) {
          await fetch(`${API}/hackathons/${id}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ team_id: newTeamId }),
          });
        }
        setSuccessTeam({ name: result.data.teamName, joinCode: result.data.joinCode });

      } else {
        // Tham gia đội bằng join code
        if (!registerJoinCode.trim()) throw new Error('Vui lòng nhập mã tham gia!');
        const joinRes = await fetch(`${API}/teams/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ joinCode: registerJoinCode }),
        });
        const joinResult = await joinRes.json();
        if (!joinRes.ok || joinResult.status === 'error') throw new Error(joinResult.message || 'Tham gia đội thi thất bại.');
        // Sau khi tham gia đội, cập nhật myTeam và để user đăng ký tiếp nếu muốn
        setSuccessTeam({ name: joinResult.data.teamName, joinCode: joinResult.data.joinCode });
      }
    } catch (err: any) {
      setRegisterError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmittingRegistration(false);
    }
  };

  const handleCloseRegisterModal = () => {
    const wasSuccessful = !!successTeam;
    setShowRegisterModal(false);
    setRegisterTeamName('');
    setRegisterJoinCode('');
    setRegisterError(null);
    setSuccessTeam(null);
    setMyTeam(null);
    setRegisterType('create');
    
    // Nếu đăng ký thành công, reload lại trang để cập nhật danh sách đội thi
    if (wasSuccessful) {
      window.location.reload();
    }
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

        // Lấy lịch trình thực tế
        const schedRes = await fetch(`http://localhost:8000/index.php/api/schedules?contest_id=${id}`);
        if (schedRes.ok) {
          const schedData = await schedRes.json();
          if (schedData.status === 'success') {
            setSchedules(schedData.data);
          }
        }

        // Lấy đề bài (nếu đã release)
        try {
          const headers: Record<string, string> = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          const challRes = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}/challenge`, {
            headers
          });
          const challData = await challRes.json();
          if (challRes.ok && challData.status === 'success') {
            setChallenge(challData.data);
          } else {
            setChallenge({ available: false, message: challData.message || 'Bạn không có quyền xem đề bài.' });
          }
        } catch (e) {
          // Ignored
        }

        // Kiểm tra xem đội hiện tại đã đăng ký chưa
        if (token) {
          try {
            const contestsRes = await fetch(`${API}/teams/my-team/contests`, { headers: { Authorization: `Bearer ${token}` } });
            if (contestsRes.ok) {
                const contestsData = await contestsRes.json();
                if (contestsData.status === 'success' && contestsData.data) {
                     const registered = contestsData.data.some((c: any) => c.id == id);
                     setIsTeamRegistered(registered);
                }
            }
          } catch(e) {}
        }

        // Fetch danh sách các đội tham gia
        try {
          const teamsRes = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}/teams`);
          const teamsResult = await teamsRes.json();
          if (teamsRes.ok && teamsResult.status === 'success') {
            setRegisteredTeams(teamsResult.data || []);
          }
        } catch (tErr) {
          console.error("Lỗi tải danh sách đội thi:", tErr);
        }

        // Fetch danh sách dự án (submissions)
        try {
          const subsRes = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}/submissions`);
          if (subsRes.ok) {
            const subsResult = await subsRes.json();
            if (subsResult.status === 'success') {
              setSubmissions(subsResult.data || []);
            }
          }
        } catch (sErr) {
          console.error("Lỗi tải danh sách dự án:", sErr);
        }

        // Fetch danh sách người tham gia
        try {
          const partRes = await fetch(`http://localhost:8000/index.php/api/hackathons/${id}/participants`);
          const partResult = await partRes.json();
          if (partRes.ok && partResult.status === 'success') {
            setParticipants(partResult.data || []);
          }
        } catch (pErr) {
          console.error("Lỗi tải danh sách người tham gia:", pErr);
        }

      } catch (e: any) {
        setError(e.message || 'Lỗi tải chi tiết cuộc thi');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  useEffect(() => {
    if (!eventData || !eventData.registration_deadline) {
      setIsRegistrationClosed(false);
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      setCurrentTime(now);

      // Đặt deadline tới 23:59:59 của ngày kết thúc đăng ký
      const deadline = new Date(eventData.registration_deadline);
      deadline.setHours(23, 59, 59, 999);
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setIsRegistrationClosed(true);
        setTimeLeft('Đã hết hạn đăng ký');
      } else {
        setIsRegistrationClosed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const fZero = (n: number) => n < 10 ? `0${n}` : n;
        setTimeLeft(`Còn ${days} ngày ${fZero(hours)}:${fZero(minutes)}:${fZero(seconds)}`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [eventData]);

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
    teams: eventData.registered_teams_count ?? eventData.registeredTeamsCount ?? 0,
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
    image: eventData.image || eventData.image_url || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    { id: 'overview', label: 'Tổng Quan', icon: Info },
    { id: 'schedule', label: 'Dòng Thời Gian', icon: Clock },
    { id: 'rules', label: 'Quy Tắc', icon: FileText },
    { id: 'prizes', label: 'Giải Thưởng', icon: Trophy },
    { id: 'challenge', label: 'Dự Án', icon: BookOpen },
    { id: 'participants', label: 'Người Tham Gia', icon: Users },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Full-width Cover Image */}
      <div className="w-full h-64 lg:h-80 bg-cover bg-center" style={{
         backgroundImage: event.image && (event.image.startsWith('http') || event.image.startsWith('/')) 
           ? `url(${event.image})` 
           : 'none',
         background: !(event.image && (event.image.startsWith('http') || event.image.startsWith('/'))) ? event.image : 'none'
      }}></div>

      {/* 2. Sticky Tab Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Logo overlapping the cover and tab bar */}
          <div className="absolute -top-16 left-4 sm:left-6 lg:left-8 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md z-50 flex items-center justify-center">
            {eventData.logo_url ? (
              <img src={eventData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#111827] text-white font-bold flex flex-col items-center justify-center text-center p-2 text-sm">
                <span className="text-orange-500 font-black text-lg">PORTO HACK</span>
                <span className="text-xs tracking-widest mt-1">SANTOS 2026</span>
              </div>
            )}
          </div>

          <div className="flex overflow-x-auto hide-scrollbar pl-40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div>
               <h1 className="text-4xl font-bold text-blue-900 mb-3">{event.name}</h1>
               <p className="text-gray-700 font-medium mb-6">{event.description}</p>
               
               {/* Registration Button */}
               {isTeamRegistered && event.status === 'Đang diễn ra' ? (
                 <button onClick={() => navigate(`/submit`)} className="block w-full py-3 mb-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md">Nộp Dự Án</button>
               ) : isRegistrationClosed ? (
                 <button disabled className="block w-full py-3 mb-3 bg-gray-300 text-gray-500 rounded-lg font-bold cursor-not-allowed">Đã hết hạn đăng ký</button>
               ) : (
                 <button onClick={handleOpenRegisterModal} className="block w-full py-3 mb-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                   THAM GIA HACKATHON
                 </button>
               )}

               <button className="block w-full py-3 mb-3 bg-[#4F39F6] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                 <Info size={18} /> REGULAMENTO OFFICIAL
               </button>
               <button className="block w-full py-3 mb-6 bg-[#4F39F6] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                 <FileText size={18} /> HƯỚNG DẪN THAM GIA
               </button>
               
               <div className="mt-8 border-t border-gray-100 pt-6">
                 <h3 className="font-bold text-gray-900 mb-4 text-lg">Dòng thời gian</h3>
                 <div className="space-y-5 text-sm">
                   <div>
                     <div className="text-gray-900 font-semibold mb-1">Đăng ký</div>
                     <div className="text-gray-600">
                       {eventData.start_date ? new Date(eventData.start_date).toLocaleString('vi-VN', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '12 tháng 6 năm 2026 - 10:00'}
                     </div>
                   </div>
                   <div>
                     <div className="text-gray-900 font-semibold mb-1">Danh sách hy vọng</div>
                     <div className="text-gray-600">
                       {eventData.end_date ? new Date(eventData.end_date).toLocaleString('vi-VN', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '13 tháng 7 năm 2026 - 10:00'}
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-transparent p-0">
               
               {/* OVERVIEW TAB */}
               {activeTab === 'overview' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6">Chào mừng đến với {event.name}</h2>
                    <p className="mb-4">Đây là nền tảng chính thức nơi toàn bộ sự kiện sẽ diễn ra.</p>
                    <p className="mb-8 font-semibold">Bắt đầu từ đây: tab này tổng hợp tất cả những thông tin bạn cần biết. Hãy theo dõi kỹ các hướng dẫn để có trải nghiệm tham gia tốt nhất.</p>
                    
                    {/* Fake Video Block */}
                    <div className="w-full bg-gray-900 rounded-xl overflow-hidden shadow-md flex flex-col justify-end p-6 relative min-h-[300px]">
                      <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')"}}></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">gu</div>
                        <div className="text-white">
                          <div className="font-bold text-xl">Bắt đầu từ đây: Chào mừng và hướng dẫn đăng ký</div>
                          <div className="text-gray-300">Ban tổ chức Porto Hack</div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mt-10 mb-4 text-blue-900">Quy tắc (Regras)</h3>
                    <p className="mb-4 text-gray-700">Bạn có thể tham gia vào quy định của {event.name}: bạn có thể đăng ký, bạn có thể tham gia, và dễ dàng theo sát những việc cần làm. Vui lòng đọc kỹ trước khi đăng ký, vì đây là nơi giải đáp hầu hết các thắc mắc của bạn.</p>
                    <p className="text-gray-400 mb-8">Trường hợp này có nhiều vấn đề khác nhau trong trang này. Quy định chính thức, phổ biến hoặc Quy định cụ thể.</p>
                    
                    <h3 className="text-2xl font-bold mt-8 mb-4 text-blue-900">Đối tượng tham gia (Quem pode participar)</h3>
                    <p className="mb-4 text-gray-700">Không yêu cầu kinh nghiệm chuyên sâu. Nếu bạn đang có niềm đam mê thiết lập cổng thông tin và xây dựng trải nghiệm thực tế, đây là chương trình dành cho bạn.</p>
                    
                    <h4 className="font-bold text-lg mt-6 mb-3 text-gray-900">Bạn có thể tham gia nếu:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Bạn trên 18 tuổi và thông tin sẽ được lưu trữ bảo mật.</li>
                      <li>Bạn là sinh viên đang theo học tại các trường đại học/viện nghiên cứu (vượt qua các học kỳ khó khăn).</li>
                      <li>Bạn là sinh viên (18+) các ngành công nghệ, đang tìm kiếm cơ hội thực tập, với thẻ sinh viên còn hiệu lực.</li>
                      <li>Bạn là chuyên gia công nghệ, người đã tốt nghiệp (MBA hoặc tương đương), mong muốn thử thách bản thân.</li>
                    </ul>
                 </div>
               )}

               {/* TIMELINE TAB */}
               {activeTab === 'schedule' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 pb-4">Dòng thời gian</h2>
                    
                    <div className="relative border-l border-gray-200 ml-3 space-y-10 py-4">
                      {(() => {
                        if (!eventData) return null;
                        const items = [];
                        let customItems: any[] = [];
                        let scheduleMeta: any = {};
                        
                        if (eventData.schedule) {
                          try {
                            const parsed = JSON.parse(eventData.schedule);
                            if (Array.isArray(parsed)) {
                              customItems = parsed;
                            } else if (parsed && typeof parsed === 'object') {
                              customItems = parsed.items || [];
                              scheduleMeta = parsed;
                            }
                          } catch(e) {}
                        }
                        
                        const regStart = scheduleMeta.registrationStart || eventData.registration_start;
                        const regEnd = scheduleMeta.registrationEnd || eventData.registration_end || eventData.registration_deadline;
                        const startDate = eventData.start_date;
                        const endDate = eventData.end_date;
                        const subDeadline = scheduleMeta.submissionDeadline || eventData.submission_deadline;
                        
                        if (regStart) {
                          items.push({ time: regStart, title: 'Mở đăng ký' });
                        }
                        if (regEnd) {
                          items.push({ time: regEnd, title: 'Hạn chót đăng ký' });
                        }
                        if (startDate) {
                          items.push({ time: startDate, title: 'Bắt đầu sự kiện' });
                        }
                        if (endDate) {
                          items.push({ time: endDate, title: 'Kết thúc sự kiện' });
                        }
                        if (subDeadline) {
                          items.push({ time: subDeadline, title: 'Hạn chót nộp bài' });
                        }
                        
                        if (customItems.length > 0) {
                          customItems.forEach((item: any) => {
                            if (item.time && item.name) {
                              items.push({ time: item.time.replace('T', ' '), title: item.name });
                            }
                          });
                        }
                        
                        // Sort by time ascending
                        items.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                        if (items.length === 0) {
                           return <div className="text-gray-500 italic pl-8">Chưa có thông tin lịch trình.</div>;
                        }

                        return items.map((item, idx) => {
                           const isPast = new Date(item.time).getTime() < new Date().getTime();
                           return (
                             <div key={idx} className="relative pl-8">
                                <div className={`absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full border-2 ${isPast ? 'bg-[#ff7a45] border-[#ff7a45]' : 'bg-white border-gray-300'}`}></div>
                                <div className="text-sm text-gray-400 mb-1">
                                  {new Date(item.time).toLocaleString('vi-VN')}
                                </div>
                                <div className={`text-lg font-medium ${isPast ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {item.title}
                                </div>
                             </div>
                           );
                        });
                      })()}
                    </div>
                 </div>
               )}

               {/* RULES TAB */}
               {activeTab === 'rules' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6">Quy tắc Tham gia (Regras)</h2>
                    
                    {eventData.rules ? (
                      <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        {eventData.rules}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">1. Quy định chung</h3>
                          <p className="text-gray-700">Tất cả các đội thi phải tuân thủ nghiêm ngặt các quy định do Ban tổ chức (BTC) đề ra. Bất kỳ hành vi gian lận, sao chép code không ghi nguồn, hoặc sử dụng các sản phẩm đã hoàn thiện trước khi cuộc thi bắt đầu đều sẽ bị loại lập tức.</p>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">2. Đội thi và Thành viên</h3>
                          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                            <li>Mỗi đội thi có tối thiểu 3 thành viên và tối đa 5 thành viên.</li>
                            <li>Một người chỉ được phép tham gia vào duy nhất 01 đội thi trong khuôn khổ chương trình.</li>
                            <li>Mọi sự thay đổi về nhân sự (thêm, bớt thành viên) phải được thông báo và nhận được sự chấp thuận từ BTC trước khi Vòng sơ loại kết thúc.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">3. Quyền sở hữu trí tuệ</h3>
                          <p className="text-gray-700">Toàn bộ mã nguồn, tài liệu, và sản phẩm được tạo ra trong quá trình diễn ra Hackathon đều thuộc quyền sở hữu của các thành viên trong đội. Tuy nhiên, BTC có quyền sử dụng hình ảnh, tên dự án và mô tả dự án cho các mục đích truyền thông phi lợi nhuận mà không cần xin phép trước.</p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">4. Tiêu chí Đánh giá</h3>
                          <p className="text-gray-700">Các dự án sẽ được Ban Giám khảo chấm điểm dựa trên các tiêu chí chính sau:</p>
                          <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                            <li><strong>Tính sáng tạo (30%):</strong> Giải pháp độc đáo, chưa từng có trên thị trường hoặc có cách tiếp cận mới lạ.</li>
                            <li><strong>Tính ứng dụng (30%):</strong> Giải pháp có khả năng giải quyết vấn đề thực tế, quy mô thị trường tiềm năng lớn.</li>
                            <li><strong>Công nghệ (20%):</strong> Độ phức tạp kỹ thuật, kiến trúc hệ thống và độ hoàn thiện của sản phẩm (MVP).</li>
                            <li><strong>Thuyết trình (20%):</strong> Kỹ năng giao tiếp, trình bày rõ ràng, trả lời câu hỏi phản biện từ Ban Giám khảo.</li>
                          </ul>
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {/* PRIZES TAB */}
               {activeTab === 'prizes' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                      <Trophy className="text-yellow-500" size={28} />
                      Cơ cấu Giải thưởng
                    </h2>
                    
                    {eventData.prize ? (
                      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-8 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Tổng giá trị giải thưởng</span>
                        <span className="text-4xl font-black text-yellow-600">{eventData.prize}</span>
                      </div>
                    ) : null}

                    {eventData.prize_details ? (
                      <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                        {eventData.prize_details}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Fake Prizes if no details */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">Hạng 1</div>
                          <Trophy className="text-yellow-400 mb-4" size={40} />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Giải Nhất</h3>
                          <p className="text-2xl font-black text-blue-600 mb-4">50.000.000đ</p>
                          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                            <li>Tiền mặt và Giấy khen</li>
                            <li>Gói AWS Credits $1,000</li>
                            <li>Cơ hội phỏng vấn trực tiếp</li>
                          </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="absolute top-0 right-0 bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1 rounded-bl-lg">Hạng 2</div>
                          <Award className="text-gray-400 mb-4" size={40} />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Giải Nhì</h3>
                          <p className="text-2xl font-black text-blue-600 mb-4">20.000.000đ</p>
                          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                            <li>Tiền mặt và Giấy khen</li>
                            <li>Gói AWS Credits $500</li>
                          </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="absolute top-0 right-0 bg-orange-300 text-orange-900 text-xs font-bold px-3 py-1 rounded-bl-lg">Hạng 3</div>
                          <Award className="text-orange-400 mb-4" size={40} />
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Giải Ba</h3>
                          <p className="text-2xl font-black text-blue-600 mb-4">10.000.000đ</p>
                          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                            <li>Tiền mặt và Giấy khen</li>
                          </ul>
                        </div>
                      </div>
                    )}
                 </div>
               )}

               {/* PROJECTS TAB (DỰ ÁN) */}
               {activeTab === 'challenge' && (
                 <div className="space-y-8 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <BookOpen className="text-blue-600" size={28} />
                        Dự Án Tham Gia
                      </h2>
                      <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">{submissions.length} dự án</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {submissions.length > 0 ? (
                        submissions.map((sub: any) => (
                          <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group bg-white">
                            <div className="h-40 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                              {/* Using a placeholder if demo video is not visual, or just a colored background */}
                              {sub.project_avatar_url ? (
                                <img src={`http://localhost:8000/index.php${sub.project_avatar_url}`} alt={sub.project_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                  <BookOpen className="text-blue-300 w-16 h-16" />
                                </div>
                              )}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">{sub.category || 'Dự án'}</div>
                            </div>
                            <div className="p-5">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={sub.project_name}>{sub.project_name}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4" title={sub.description}>{sub.description || 'Chưa có mô tả chi tiết cho dự án này.'}</p>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  {sub.logo_url ? (
                                    <img src={`http://localhost:8000/index.php${sub.logo_url}`} alt={sub.team_name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                                      {sub.team_name ? sub.team_name.substring(0, 2) : 'TM'}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]" title={sub.team_name}>{sub.team_name}</span>
                                </div>
                                {sub.github_url && (
                                  <a href={sub.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                    Source Code <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                            <BookOpen size={32} />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">Chưa có dự án nào</h3>
                          <p className="text-gray-500">Cuộc thi này chưa có dự án nào được nộp.</p>
                        </div>
                      )}
                    </div>
                 </div>
               )}

               {/* PARTICIPANTS TAB */}
               {activeTab === 'participants' && (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-white border-b border-gray-200 text-gray-500 font-medium">
                         <tr>
                           <th className="px-6 py-4 lowercase first-letter:uppercase">participant</th>
                           <th className="px-6 py-4">Skills</th>
                           <th className="px-6 py-4">Project</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                         {participants.length > 0 ? (
                           participants.map((p) => (
                             <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                               <td className="px-6 py-3">
                                 <div className="flex items-center gap-3">
                                   <img src={p.avatar_url} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                   <span 
                                     className="font-medium text-gray-900 hover:underline cursor-pointer"
                                     onClick={() => setSelectedParticipant(p)}
                                   >
                                     {p.name}
                                   </span>
                                 </div>
                               </td>
                               <td className="px-6 py-3">
                                 {p.skills && p.skills.length > 0 ? (
                                   <div className="flex flex-wrap gap-1.5">
                                     {p.skills.map((skill: string, idx: number) => (
                                       <span key={idx} className="bg-[#4b22b2] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                         {skill}
                                       </span>
                                     ))}
                                   </div>
                                 ) : (
                                   <span className="inline-block border border-gray-200 text-[#a3a3a3] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide bg-transparent">
                                     NO SKILLS
                                   </span>
                                 )}
                               </td>
                               <td className="px-6 py-3">
                                 {p.project ? (
                                   <span className="font-medium text-gray-900">{p.project}</span>
                                 ) : (
                                   <span className="inline-block border border-gray-200 text-[#a3a3a3] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide bg-transparent">
                                     NO PROJECT
                                   </span>
                                 )}
                               </td>
                             </tr>
                           ))
                         ) : (
                           <tr>
                             <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                               Chưa có người tham gia nào.
                             </td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}
               {/* LEADERBOARD TAB */}
               {activeTab === 'leaderboard' && (
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <LeaderboardPage contestId={id} />
                 </div>
               )}

               {activeTab !== 'overview' && activeTab !== 'schedule' && activeTab !== 'rules' && activeTab !== 'prizes' && activeTab !== 'challenge' && activeTab !== 'participants' && activeTab !== 'leaderboard' && (
                 <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center py-20">
                    <p className="text-gray-500 text-lg">Nội dung chi tiết cho tab này đang được cập nhật.</p>
                 </div>
               )}
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
                  {myTeam && (
                    <button
                      onClick={() => { setRegisterType('existing'); setRegisterError(null); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        registerType === 'existing' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Đội của tôi
                    </button>
                  )}
                  {!myTeam && (
                    <button
                      onClick={() => { setRegisterType('create'); setRegisterError(null); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        registerType === 'create' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tạo đội thi mới
                    </button>
                  )}
                  {!myTeam && (
                    <button
                      onClick={() => { setRegisterType('join'); setRegisterError(null); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        registerType === 'join' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tham gia đội có sẵn
                    </button>
                  )}
                </div>

                {registerError && (
                  <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-left">
                    {registerError}
                  </div>
                )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                    {registerType === 'existing' && myTeam ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Đội của bạn</div>
                            <div className="font-bold text-gray-800 text-base">{myTeam.name}</div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            myTeam.isLeader ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {myTeam.isLeader ? '👑 Đội trưởng' : '👤 Thành viên'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded font-bold tracking-widest">{myTeam.joinCode}</span>
                          <span className="text-xs text-gray-500">{myTeam.memberCount}/{myTeam.maxMembers} thành viên</span>
                        </div>
                        {myTeam.isLeader
                          ? <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✅ Bạn là đội trưởng. Nhấn "Đăng ký cuộc thi" để đăng ký đội vào cuộc thi này.</p>
                          : <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">⚠️ Chỉ đội trưởng mới có quyền đăng ký đội vào cuộc thi. Hãy nhờ đội trưởng thực hiện.</p>
                        }
                      </div>
                    ) : registerType === 'create' ? (
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
                      disabled={submittingRegistration || (registerType === 'existing' && myTeam !== null && !myTeam.isLeader)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submittingRegistration && <Loader2 className="animate-spin" size={16} />}
                      <span>
                        {submittingRegistration
                          ? 'Đang đăng ký...'
                          : registerType === 'existing'
                          ? 'Đăng ký cuộc thi'
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
      {/* Modal Chi tiết người tham gia */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 p-6 relative text-center">
            <button 
              onClick={() => setSelectedParticipant(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-blue-50">
               <img src={selectedParticipant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedParticipant.name)}`} alt={selectedParticipant.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedParticipant.name}</h3>
            {selectedParticipant.email && <p className="text-gray-500 text-sm mb-4">{selectedParticipant.email}</p>}
            
            <div className="bg-blue-50 rounded-xl p-4 mt-4 text-left border border-blue-100">
              <div className="mb-4">
                <span className="block text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Dự án tham gia</span>
                <span className="text-gray-900 font-semibold">{selectedParticipant.project || 'Chưa có dự án'}</span>
                {selectedParticipant.project && (() => {
                  const team = registeredTeams.find((t: any) => t.name === selectedParticipant.project);
                  if (team) {
                    return (
                      <button 
                        onClick={() => {
                          setSelectedParticipant(null);
                          setSelectedTeam(team);
                        }}
                        className="mt-2 text-xs bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xem chi tiết đội thi
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              <div>
                <span className="block text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Kỹ năng (Skills)</span>
                {selectedParticipant.skills && selectedParticipant.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedParticipant.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm italic font-medium">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>
            
            <button onClick={() => setSelectedParticipant(null)} className="w-full mt-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm transition-colors cursor-pointer">
              Đóng
            </button>
          </div>
        </div>
      )}
      
      {/* Modal Chi tiết Đội thi */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 p-6 relative">
            <button 
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
               <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm uppercase">
                 {selectedTeam.name ? selectedTeam.name.substring(0, 2) : 'TM'}
               </div>
               <div>
                 <h3 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h3>
                 <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                   {selectedTeam.category || 'Chưa xác định lĩnh vực'}
                 </span>
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="bg-gray-50 p-4 rounded-xl">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Thông tin chung</h4>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="block text-gray-500 mb-1">Trưởng nhóm</span>
                     <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                       <UserCheck size={14} className="text-blue-600" /> 
                       {selectedTeam.leader_name || selectedTeam.leaderName || 'Không có thông tin'}
                     </span>
                   </div>
                   <div>
                     <span className="block text-gray-500 mb-1">Số lượng thành viên</span>
                     <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                       <Users size={14} className="text-blue-600" />
                       {selectedTeam.memberCount || selectedTeam.members_count || selectedTeam.member_count || (Array.isArray(selectedTeam.members) ? selectedTeam.members.length : 1)}
                     </span>
                   </div>
                 </div>
               </div>
               
               {selectedTeam.skills && selectedTeam.skills.length > 0 && (
                 <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Công nghệ sử dụng</h4>
                   <div className="flex flex-wrap gap-1.5">
                     {(Array.isArray(selectedTeam.skills) ? selectedTeam.skills : selectedTeam.skills.split(',')).map((skill: string, idx: number) => (
                       <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-gray-200">
                         {skill.trim()}
                       </span>
                     ))}
                   </div>
                 </div>
               )}
            </div>
            
            <button onClick={() => setSelectedTeam(null)} className="w-full mt-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
