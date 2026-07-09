import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, Clock, User, CheckSquare, RefreshCw, Sparkles } from 'lucide-react';

const API = 'http://localhost:8000/index.php/api';

function getToken() { return localStorage.getItem('auth_token') || ''; }

function timeAgo(dateInput: any) {
  if (!dateInput) return 'Không rõ';
  
  // Xử lý định dạng date trả về từ Doctrine/PHP
  const dateStr = typeof dateInput === 'object' && dateInput.date ? dateInput.date : dateInput;
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return 'Vừa xong';
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
}

export function MentorDashboardPage() {
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'assigned' | 'resolved'>('assigned');
  const [responses, setResponses] = useState<Record<number, string>>({});

  const fetchTickets = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const [resOpen, resMy] = await Promise.all([
        fetch(`${API}/mentor/tickets/open`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${API}/mentor/tickets/my`, { headers: { Authorization: `Bearer ${getToken()}` } })
      ]);
      const dataOpen = await resOpen.json();
      const dataMy = await resMy.json();
      
      if (dataOpen.status === 'success') setOpenTickets(dataOpen.data || []);
      if (dataMy.status === 'success') setMyTickets(dataMy.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Tự động cập nhật mỗi 30 giây để Mentor không bỏ lỡ yêu cầu mới
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (id: number) => {
    try {
      const res = await fetch(`${API}/mentor/tickets/${id}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      
      // Tạo một thông báo toast đẹp hoặc alert đơn giản
      alert('Nhận hỗ trợ thành công!');
      fetchTickets(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolve = async (id: number) => {
    const responseText = responses[id] || '';
    try {
      const res = await fetch(`${API}/mentor/tickets/${id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ response: responseText })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      
      alert('Đã đánh dấu hoàn thành yêu cầu hỗ trợ!');
      setResponses(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchTickets(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const myAssignedTickets = myTickets.filter(t => t.status === 'ASSIGNED');
  const myResolvedTickets = myTickets.filter(t => t.status === 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header section with Logo/Stats and Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100 transition-transform hover:scale-105 duration-300">
            <HelpCircle size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Mentor Dashboard
              <span className="text-[10px] bg-orange-100 text-orange-850 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                Live Support
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 font-medium">Hỗ trợ các đội thi vượt qua thử thách và hoàn thành dự án</p>
          </div>
        </div>

        {/* Sync Button */}
        <button
          onClick={() => fetchTickets(false)}
          disabled={loading || isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw size={16} className={`text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Đang làm mới...' : 'Làm mới ngay'}
        </button>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Urgent Open Tickets */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-orange-100 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-orange-600 transition-transform group-hover:scale-110 duration-300">
            <Clock size={100} />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Cần Hỗ Trợ Gấp</span>
            <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{openTickets.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Yêu cầu đang đợi Mentor nhận</p>
          </div>
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-100">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 2: My Assigned Tickets */}
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-100 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-blue-600 transition-transform group-hover:scale-110 duration-300">
            <User size={100} />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Đang Xử Lý</span>
            <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{myAssignedTickets.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Bạn đang hỗ trợ trực tiếp</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-100">
            <User size={20} />
          </div>
        </div>

        {/* Card 3: Resolved Tickets */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-green-100 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-green-600 transition-transform group-hover:scale-110 duration-300">
            <CheckCircle size={100} />
          </div>
          <div className="space-y-1 z-10">
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Đã hoàn thành</span>
            <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">{myResolvedTickets.length}</h3>
            <p className="text-xs text-gray-500 mt-1">Số yêu cầu bạn đã giải quyết</p>
          </div>
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-100">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Open Tickets (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-150 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></span>
              Yêu cầu hỗ trợ mới ({openTickets.length})
            </h2>
            <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded">Cập nhật tự động</span>
          </div>

          {loading && openTickets.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 border border-gray-100 rounded-2xl animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : openTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-inner">
                <Sparkles size={36} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">Không có yêu cầu nào đang chờ</h3>
              <p className="text-gray-500 text-sm max-w-sm">Tất cả các đội thi hiện đang hoạt động bình ổn hoặc các yêu cầu đã được tiếp nhận hoàn tất.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {openTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="group relative p-5 border border-orange-100 bg-gradient-to-b from-orange-50/20 to-white hover:from-orange-50/50 hover:to-orange-55/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                  <div className="flex justify-between items-start mb-3 pl-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
                      Mã Đội: {ticket.teamId}
                    </span>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </div>
                  <div className="bg-white/90 border border-orange-100/40 rounded-xl p-3.5 mb-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{ticket.topic}</p>
                  </div>
                  <button
                    onClick={() => handleAssign(ticket.id)}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    <CheckSquare size={16} /> Nhận Hỗ Trợ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Assigned Tickets & History (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
          {/* Tab Header */}
          <div className="flex p-1.5 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-2.5 text-center text-sm font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'assigned'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <User size={16} />
              Đang Xử Lý ({myAssignedTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`flex-1 py-2.5 text-center text-sm font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'resolved'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <CheckCircle size={16} />
              Đã Xong ({myResolvedTickets.length})
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'assigned' ? (
            <div className="space-y-4">
              {myAssignedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                    <User size={28} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Chưa nhận yêu cầu nào</h4>
                  <p className="text-gray-500 text-xs max-w-[240px] leading-relaxed">Hãy chọn nhận các yêu cầu bên cột danh sách yêu cầu mới để bắt đầu hỗ trợ.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {myAssignedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative p-5 border border-blue-100 bg-gradient-to-b from-blue-50/20 to-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Mã Đội: {ticket.teamId}
                        </span>
                        <span className="text-[11px] font-bold text-blue-500 bg-blue-50/50 px-2.5 py-1 rounded-md">
                          Đang hỗ trợ
                        </span>
                      </div>
                      <div className="bg-white border border-blue-100/50 rounded-xl p-3.5 mb-3 shadow-sm">
                        <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{ticket.topic}</p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Nhập Phản hồi / Hướng dẫn giải quyết
                        </label>
                        <textarea
                          value={responses[ticket.id] || ''}
                          onChange={(e) => setResponses({ ...responses, [ticket.id]: e.target.value })}
                          placeholder="Mô tả hướng giải quyết hoặc phản hồi cho đội thi..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed resize-none"
                        />
                      </div>

                      <button
                        onClick={() => handleResolve(ticket.id)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md hover:shadow-emerald-100 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <CheckCircle size={16} /> Đánh dấu hoàn thành
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myResolvedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                    <CheckCircle size={28} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base mb-1">Chưa hoàn thành yêu cầu nào</h4>
                  <p className="text-gray-500 text-xs max-w-[240px] leading-relaxed">Các nhiệm vụ sau khi giải quyết thành công sẽ được lưu trữ lịch sử tại đây.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[480px] overflow-y-auto pr-1">
                  {myResolvedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="group relative p-4.5 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 rounded-2xl transition-all duration-300 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          Mã Đội: {ticket.teamId}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle size={12} /> Đã Xong
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Yêu cầu:</p>
                        <p className="text-sm font-semibold text-gray-600 italic pr-2 leading-relaxed">{ticket.topic}</p>
                      </div>
                      {ticket.response && (
                        <div className="bg-emerald-50/40 border border-emerald-100/40 rounded-xl p-3 space-y-1">
                          <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Phản hồi của bạn:</p>
                          <p className="text-xs font-semibold text-emerald-800 leading-relaxed whitespace-pre-wrap">{ticket.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
