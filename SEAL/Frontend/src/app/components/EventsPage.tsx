import { useState, useEffect } from 'react';
import { Search, Filter, Users, Lightbulb, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';
import { motion } from 'motion/react';

export function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost:8000/index.php/api/hackathons');
        const result = await res.json();
        
        if (result.status === 'success' && result.data) {
          const mappedEvents = result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            startDate: item.startDate,
            endDate: item.endDate,
            location: item.location,
            teams: item.registered_teams_count || 0,
            maxTeams: item.maxTeams || 50,
            prize: item.prize || '15.000 $',
            status: item.status,
            category: item.category,
            image: item.image || item.image_url,
            description: item.description || 'Chưa có mô tả'
          }));
          
          setEvents(mappedEvents);
        }
      } catch (err: any) {
        console.error('Lỗi khi tải dữ liệu sự kiện:', err);
        setError(err.message || 'Lỗi kết nối API Backend.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = (event.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    let mappedStatusForFilter = event.status;
    if (event.status === 'ACTIVE' || event.status === 'Đang diễn ra') mappedStatusForFilter = 'ACTIVE';
    if (event.status === 'UPCOMING' || event.status === 'Sắp diễn ra') mappedStatusForFilter = 'UPCOMING';
    if (event.status === 'COMPLETED' || event.status === 'Đã kết thúc') mappedStatusForFilter = 'COMPLETED';

    const matchesFilter = filterStatus === 'all' || mappedStatusForFilter === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate days left for the progress bar
  const calculateDaysLeft = (endDateStr: string | null) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusBadge = (statusStr: string) => {
    const status = statusStr.toUpperCase();
    if (status === 'ACTIVE' || status === 'ĐANG DIỄN RA') {
      return { text: 'Sự đăng ký', bgColor: 'bg-blue-600', textColor: 'text-white' };
    }
    if (status === 'UPCOMING' || status === 'SẮP DIỄN RA') {
      return { text: 'Ý tưởng', bgColor: 'bg-[#5027d9]', textColor: 'text-white' };
    }
    if (status === 'COMPLETED' || status === 'ĐÃ KẾT THÚC') {
      return { text: 'Hoàn thành', bgColor: 'bg-white', textColor: 'text-gray-900' };
    }
    return { text: 'Sự đăng ký', bgColor: 'bg-blue-600', textColor: 'text-white' };
  };

  // Helper cho mock logo ngẫu nhiên để giống Taikai
  const getMockLogo = (id: number) => {
    const logos = [
      'https://ui-avatars.com/api/?name=PO&background=0D8ABC&color=fff&size=128',
      'https://ui-avatars.com/api/?name=CS&background=D32F2F&color=fff&size=128',
      'https://ui-avatars.com/api/?name=HA&background=303F9F&color=fff&size=128',
      'https://ui-avatars.com/api/?name=TK&background=388E3C&color=fff&size=128'
    ];
    return logos[id % logos.length];
  };
  
  const getMockCover = (id: number) => {
    const covers = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=400',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800&h=400'
    ];
    return covers[id % covers.length];
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 hidden sm:block">Khám phá Hackathon</h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1 justify-end">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5027d9]"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5027d9] appearance-none cursor-pointer text-gray-700 font-medium"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ACTIVE">Sự đăng ký</option>
                  <option value="UPCOMING">Ý tưởng</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 h-[460px]">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-6">
                  <Skeleton className="h-8 w-20 rounded-full absolute top-4 left-4" />
                  <Skeleton className="h-16 w-16 rounded-full absolute top-36 left-6 border-4 border-white" />
                  <Skeleton className="h-6 w-3/4 mt-8 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-medium">
            <p>{error}</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
          {filteredEvents.map((event, index) => {
            const badge = getStatusBadge(event.status);
            const daysLeft = calculateDaysLeft(event.endDate);
            const coverImage = (event.image && (event.image.startsWith('http') || event.image.startsWith('/'))) ? event.image : getMockCover(event.id);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col h-full"
              >
                <Link
                  to={`/events/${event.id}`}
                  className="group flex flex-col h-full bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100"
                >
                  {/* Cover Image Section (Top half) */}
                  <div className="relative h-[200px] w-full bg-gray-100">
                    <img 
                      src={coverImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${badge.bgColor} ${badge.textColor}`}>
                      {badge.text}
                    </div>
                  </div>

                  {/* Body Section */}
                  <div className="relative p-6 flex flex-col flex-1 pt-12">
                    {/* Avatar Overlapping */}
                    <div className="absolute -top-10 left-6">
                      <div className="w-20 h-20 rounded-full border-[5px] border-white overflow-hidden bg-white shadow-sm">
                        <img 
                          src={getMockLogo(event.id)} 
                          alt="Org Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Stats Top Right */}
                    <div className="absolute top-4 right-6 flex items-center gap-4 text-gray-500 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-[#5027d9]">
                        <Users size={16} /> {event.teams}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Lightbulb size={16} /> {Math.floor(event.teams * 1.5)}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-[22px] leading-tight font-bold text-gray-900 mb-3 group-hover:text-[#5027d9] transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs font-semibold text-[#5027d9] bg-[#5027d9]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Hexagon size={12}/> Chuỗi khối
                      </span>
                      <span className="text-xs font-semibold text-[#5027d9] bg-[#5027d9]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Hexagon size={12}/> Công nghệ
                      </span>
                      {event.category && event.category !== 'Công nghệ' && (
                        <span className="text-xs font-semibold text-[#5027d9] bg-[#5027d9]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Hexagon size={12}/> {event.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="mt-auto px-6 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Phần thưởng
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {event.prize || '15.000 $'}
                      </span>
                    </div>

                    {daysLeft > 0 ? (
                      <div className="flex flex-col items-end w-32">
                        <span className="text-[11px] font-bold text-[#5027d9] uppercase tracking-wider mb-2">
                          Còn {daysLeft} ngày nữa
                        </span>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className="bg-[#5027d9] h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(10, (daysLeft / 60) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </span>
                        <span className="text-sm font-bold text-gray-900 mt-1">
                          Đã đóng
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
          </motion.div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm mt-8">
            <p className="text-gray-500 text-lg font-medium">Không tìm thấy sự kiện nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
