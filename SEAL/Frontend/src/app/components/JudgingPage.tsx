import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Calendar, Search, ArrowRight, Trophy, Clock, Target, Sparkles } from 'lucide-react';

interface Hackathon {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export function JudgingPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await fetch('http://localhost:8000/index.php/api/hackathons');
        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Lỗi tải dữ liệu sự kiện');
        }
        
        setHackathons(result.data || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-500 font-medium animate-pulse">Đang tải danh sách sự kiện...</p>
        </div>
      </div>
    );
  }

  const filteredHackathons = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 text-sm font-medium mb-6">
                <Sparkles size={16} className="text-yellow-400" />
                <span>Cổng Chấm Điểm Ban Giám Khảo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Sự kiện cần <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">chấm điểm</span>
            </h1>
            <p className="text-blue-100/80 text-lg md:text-xl font-light">
                Chọn một sự kiện dưới đây để xem danh sách các dự án và bắt đầu quá trình đánh giá.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-xl text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-20">
        {error && (
          <div className="bg-white text-red-600 p-6 rounded-2xl mb-8 shadow-lg border-l-4 border-red-500 flex items-center gap-4">
            <div className="bg-red-50 p-2 rounded-full">
                <Target size={24} className="text-red-500" />
            </div>
            <div>
                <h3 className="font-bold">Đã xảy ra lỗi</h3>
                <span className="font-medium text-sm text-red-500/80">{error}</span>
            </div>
          </div>
        )}

        {hackathons.length === 0 && !error ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
                <Calendar size={48} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có sự kiện nào</h2>
            <p className="text-gray-500 max-w-md">Hệ thống hiện tại chưa có sự kiện nào được tạo. Vui lòng quay lại sau hoặc liên hệ Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHackathons.map(hackathon => (
              <div 
                key={hackathon.id}
                onClick={() => navigate(`/judging/hackathon/${hackathon.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Card Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 relative p-5 flex items-start justify-between border-b border-gray-100 overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Trophy size={100} />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl shadow-sm z-10 group-hover:scale-110 transition-transform relative">
                        <Trophy size={20} className="text-blue-600" />
                    </div>
                    <span className={`z-10 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm border relative ${
                        hackathon.status === 'UPCOMING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        (hackathon.status === 'ONGOING' || hackathon.status === 'ACTIVE') ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                        {hackathon.status}
                    </span>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                        {hackathon.name}
                    </h3>
                    
                    <p className="text-gray-500 mb-6 line-clamp-2 text-sm leading-relaxed flex-grow">
                        {hackathon.description || 'Không có mô tả cho sự kiện này.'}
                    </p>

                    <div className="space-y-2.5 mb-6">
                        <div className="flex items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <Calendar size={14} className="text-gray-400 mr-2" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-medium">Bắt đầu</span>
                                <span className="font-semibold text-gray-800">{new Date(hackathon.start_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <Clock size={14} className="text-gray-400 mr-2" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-medium">Kết thúc</span>
                                <span className="font-semibold text-gray-800">{new Date(hackathon.end_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <button className="w-full py-2.5 px-4 bg-gray-50 group-hover:bg-blue-600 text-gray-700 group-hover:text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300">
                            Chấm điểm
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
              </div>
            ))}
            
            {filteredHackathons.length === 0 && hackathons.length > 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-gray-500">Không có sự kiện nào phù hợp với từ khóa "{searchQuery}"</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-4 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Xóa tìm kiếm
                    </button>
                </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
