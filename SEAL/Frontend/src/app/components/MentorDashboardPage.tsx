import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, Clock, User, CheckSquare } from 'lucide-react';

const API = 'http://localhost:8000/index.php/api';

function getToken() { return localStorage.getItem('auth_token') || ''; }

export function MentorDashboardPage() {
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAssign = async (id: number) => {
    try {
      const res = await fetch(`${API}/mentor/tickets/${id}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      alert('Nhận hỗ trợ thành công!');
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const res = await fetch(`${API}/mentor/tickets/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      alert('Đã đánh dấu hoàn thành!');
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Hỗ trợ các đội thi vượt qua thử thách</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Yêu cầu đang mở */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-orange-500" /> Cần Hỗ Trợ Gấp ({openTickets.length})
          </h2>
          {openTickets.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Không có yêu cầu nào đang chờ.</p>
          ) : (
            <div className="space-y-4">
              {openTickets.map(ticket => (
                <div key={ticket.id} className="p-4 border border-gray-100 bg-gray-50 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">Team ID: {ticket.teamId}</span>
                    <span className="text-xs text-gray-400">{new Date(ticket.createdAt?.date || Date.now()).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{ticket.topic}</p>
                  <button onClick={() => handleAssign(ticket.id)} className="w-full py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold text-sm rounded-lg transition flex items-center justify-center gap-2">
                    <CheckSquare size={16} /> Nhận Hỗ Trợ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yêu cầu đang xử lý */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-500" /> Đang Xử Lý ({myTickets.filter(t => t.status === 'ASSIGNED').length})
          </h2>
          {myTickets.filter(t => t.status === 'ASSIGNED').length === 0 ? (
            <p className="text-gray-500 text-sm italic">Bạn chưa nhận yêu cầu nào.</p>
          ) : (
            <div className="space-y-4">
              {myTickets.filter(t => t.status === 'ASSIGNED').map(ticket => (
                <div key={ticket.id} className="p-4 border border-blue-100 bg-blue-50 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded">Team ID: {ticket.teamId}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{ticket.topic}</p>
                  <button onClick={() => handleResolve(ticket.id)} className="w-full py-2 bg-green-600 text-white hover:bg-green-700 font-bold text-sm rounded-lg transition flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Đã Xong
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
