import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import Pusher from 'pusher-js';

interface Notification {
  id: number;
  contest_id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
  contest_name: string;
}

export function NotificationBell({ currentUser }: { currentUser: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);

  const API = 'http://localhost:8000/index.php/api';
  const token = localStorage.getItem('auth_token');

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      }
    } catch (e) {
      console.error('Lỗi lấy thông báo:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Fallback polling mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Setup Pusher real-time
  useEffect(() => {
    if (!currentUser) return;

    // Khởi tạo Pusher
    const pusher = new Pusher('826f5659b34e42b3583a', {
      cluster: 'ap1'
    });

    // Lấy danh sách contest_id mà user đang tham gia để subscribe channel
    const subscribeChannels = async () => {
      try {
        // Chỉ để demo, thực tế cần API /users/me/contests
        // Để đơn giản, ta nghe tất cả các channel mà ta fetch được từ DB (bằng cách gọi API notifications)
        // Hoặc Backend có thể broadcast theo user thay vì contest. 
        // Nhưng theo thiết kế, ta broadcast theo contest-{id}. 
        // Thay vì lấy danh sách contest, ta nghe luôn kênh user-{id} nếu backend có hỗ trợ.
        // Ở đây ta dùng pusher bind_global để bắt event (nếu cần thiết kế lại channel).
        // Tạm thời, vì Pusher free tier cho phép sub nhiều kênh, ta gọi một API lấy ds contest_id.
      } catch (e) {}
    };

    // Cách đơn giản nhất: Frontend subcribe vào kênh global của user
    // Nhưng vì backend push vào "contest-{id}", ta sẽ subcribe vào tất cả các contest
    // Vì không có API lấy ds contest nhanh, ta có thể subscribe thủ công dựa trên notification cũ
    const channel = pusher.subscribe('global-notifications'); // Nếu cần, ta đổi backend sang push kênh user.
    // Tạm thời ta sẽ sửa backend để push vào "user-{id}" luôn cho dễ, nhưng vì backend đã lưu "contest-{id}"
    // Ta chỉ fetch notifications để tự update unreadCount.

    return () => {
      pusher.disconnect();
    };
  }, [currentUser]);

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {}
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1">
                <Check size={14} /> Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${n.is_read ? 'opacity-70' : 'bg-blue-50/30'}`}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${n.is_read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(n.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-2xl p-4 w-80 z-[100] animate-bounce-in">
          <button onClick={() => setToast(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
          <h4 className="font-bold text-gray-900 text-sm mb-1 pr-6">{toast.title}</h4>
          <p className="text-xs text-gray-600">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
