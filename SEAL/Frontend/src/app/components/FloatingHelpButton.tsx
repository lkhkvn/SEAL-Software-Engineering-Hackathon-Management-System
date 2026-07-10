import { useState, useEffect } from 'react';
import { HelpCircle, X, AlertCircle, Loader2 } from 'lucide-react';

const API = 'http://localhost:8000/index.php/api';

function getToken() { return localStorage.getItem('auth_token') || ''; }

interface FloatingHelpButtonProps {
  currentUser: any;
}

export function FloatingHelpButton({ currentUser }: FloatingHelpButtonProps) {
  // Nút chỉ hiển thị cho PARTICIPANT và ADMIN (để test)
  const isAllowed = currentUser && (
    currentUser.role?.toUpperCase() === 'PARTICIPANT' || 
    currentUser.role?.toUpperCase() === 'ADMIN'
  );

  if (!isAllowed) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [checkedTeam, setCheckedTeam] = useState(false);
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [modalTab, setModalTab] = useState<'request' | 'history'>('request');
  const [historyTickets, setHistoryTickets] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnreadTickets = async () => {
    try {
      const res = await fetch(`${API}/mentor/tickets/team`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const tickets = data.data || [];
        setHistoryTickets(tickets);
        const resolvedTickets = tickets.filter((t: any) => t.status === 'RESOLVED');
        const seenIds = JSON.parse(localStorage.getItem('seen_resolved_tickets') || '[]');
        const unread = resolvedTickets.filter((t: any) => !seenIds.includes(t.id)).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Lỗi khi đếm tin nhắn hỗ trợ chưa đọc:', err);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      checkUnreadTickets();
      const interval = setInterval(checkUnreadTickets, 15000);
      return () => clearInterval(interval);
    }
  }, [isAllowed]);

  const fetchHistoryTickets = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/mentor/tickets/team`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const tickets = data.data || [];
        setHistoryTickets(tickets);
        
        // Đánh dấu tất cả resolved tickets hiện tại là đã xem
        const resolvedIds = tickets.filter((t: any) => t.status === 'RESOLVED').map((t: any) => t.id);
        const seenIds = JSON.parse(localStorage.getItem('seen_resolved_tickets') || '[]');
        const newSeenIds = Array.from(new Set([...seenIds, ...resolvedIds]));
        localStorage.setItem('seen_resolved_tickets', JSON.stringify(newSeenIds));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch sử hỗ trợ:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenClick = async () => {
    setIsOpen(true);
    setLoading(true);
    setError('');
    setCheckedTeam(false);
    setModalTab('request');
    
    // Gọi API kiểm tra đội thi của người dùng
    try {
      const res = await fetch(`${API}/users/me/team`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setUserTeam(data.data);
        if (data.data) {
          fetchHistoryTickets();
        }
      } else {
        setUserTeam(null);
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra thông tin đội:', err);
      setUserTeam(null);
    } finally {
      setLoading(false);
      setCheckedTeam(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTopic('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Vui lòng nhập nội dung cần hỗ trợ.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/mentor/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(data.message || 'Lỗi gửi yêu cầu.');
      }
      alert('Đã gửi yêu cầu hỗ trợ tới Mentor thành công!');
      fetchHistoryTickets();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Không thể gửi yêu cầu hỗ trợ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpenClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        title="Gọi Mentor hỗ trợ"
      >
        <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20 pointer-events-none group-hover:opacity-0 transition-opacity"></span>
        <HelpCircle size={26} className="transition-transform group-hover:rotate-12" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white animate-bounce z-50">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <HelpCircle size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Gọi Mentor Hỗ Trợ</h2>
                  <p className="text-orange-100 text-xs mt-0.5 font-medium">Kết nối trực tiếp tới ban cố vấn chuyên môn</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="text-orange-500 animate-spin" size={32} />
                  <span className="text-sm font-semibold text-gray-500">Đang xác thực thông tin đội thi...</span>
                </div>
              ) : checkedTeam && !userTeam ? (
                /* Trường hợp CHƯA CÓ ĐỘI */
                <div className="space-y-4 py-2 text-center">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
                    <AlertCircle size={26} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-gray-800 text-base">Bạn chưa tham gia đội thi nào!</h3>
                    <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                      Để nhận được sự hỗ trợ từ Mentor, bạn cần phải thuộc một đội thi. Hãy tạo đội mới hoặc tham gia đội thi tại trang **Sự kiện** hoặc **Hồ sơ cá nhân** trước nhé.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full mt-4 py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                /* Trường hợp ĐÃ CÓ ĐỘI */
                <div className="space-y-5">
                  {/* Tab Selector */}
                  <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setModalTab('request')}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        modalTab === 'request'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Gửi Yêu Cầu Hỗ Trợ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('history');
                        fetchHistoryTickets();
                      }}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        modalTab === 'history'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Lịch Sử Hỗ Trợ ({historyTickets.length})
                    </button>
                  </div>

                  {modalTab === 'request' ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex gap-2 items-center">
                          <AlertCircle size={16} className="shrink-0" /> 
                          <span className="font-medium">{error}</span>
                        </div>
                      )}

                      <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider">Đội của bạn</span>
                          <h4 className="font-bold text-gray-800 text-sm">{userTeam?.name}</h4>
                        </div>
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full">
                          Team ID: {userTeam?.id}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vấn đề cần hỗ trợ</label>
                        <textarea
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                          placeholder="Nhóm em đang gặp lỗi cấu hình Database Docker hoặc cần tư vấn về luồng nghiệp vụ chấm điểm..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm leading-relaxed bg-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || !topic.trim()}
                          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-50 font-bold text-sm shadow-md shadow-orange-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Đang gửi...
                            </>
                          ) : (
                            'Gửi yêu cầu'
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Lịch sử Yêu cầu */
                    <div className="space-y-4">
                      {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                          <Loader2 size={24} className="text-orange-500 animate-spin" />
                          <span className="text-xs text-gray-400">Đang tải lịch sử...</span>
                        </div>
                      ) : historyTickets.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <HelpCircle size={32} className="mx-auto mb-2 text-gray-300 animate-pulse" />
                          <p className="text-xs font-semibold text-gray-500">Chưa gửi yêu cầu hỗ trợ nào</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                          {historyTickets.map((ticket) => (
                            <div 
                              key={ticket.id}
                              className="p-4 border border-gray-100 bg-gray-50/50 rounded-2xl space-y-3 relative overflow-hidden"
                            >
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  ticket.status === 'RESOLVED' 
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ticket.status === 'ASSIGNED'
                                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {ticket.status === 'RESOLVED' 
                                    ? 'Đã xử lý' 
                                    : ticket.status === 'ASSIGNED' 
                                    ? 'Đang xử lý' 
                                    : 'Chờ nhận'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  {new Date(ticket.createdAt?.date || Date.now()).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              
                              <p className="text-sm font-semibold text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {ticket.topic}
                              </p>

                              {ticket.response && (
                                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Phản hồi từ Mentor:</span>
                                  <p className="text-xs font-semibold text-emerald-900 leading-relaxed whitespace-pre-wrap">
                                    {ticket.response}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                      >
                        Đóng cửa sổ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
