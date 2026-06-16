import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Search, Users, ExternalLink, ArrowLeft } from 'lucide-react';

interface Team {
  teamId: number;
  teamName: string;
  category: string;
  projectName: string | null;
  projectDescription: string | null;
  githubUrl: string | null;
  demoVideoUrl: string | null;
  fileUrl: string | null;
  contestId: number;
}

export function JudgingTeamsPage() {
  const { hackathonId } = useParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('Không tìm thấy token đăng nhập');

        const response = await fetch('http://localhost:8000/index.php/api/judging/teams', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Lỗi tải dữ liệu');
        }
        
        // Lọc các đội thuộc về hackathon hiện tại
        const allTeams: Team[] = result.data.teams || [];
        const filteredByHackathon = allTeams.filter(t => t.contestId === Number(hackathonId));
        
        setTeams(filteredByHackathon);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [hackathonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const filteredTeams = teams.filter(team => 
    team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (team.projectName && team.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <button 
            onClick={() => navigate('/judging')}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách sự kiện
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Danh sách dự án</h1>
            <p className="text-gray-500 mt-2 text-lg">Chọn một dự án để bắt đầu xem chi tiết và chấm điểm.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo đội hoặc tên dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-200 flex items-center">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {teams.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-gray-400">
            <Users size={64} className="mb-6 opacity-40 text-blue-500" />
            <p className="text-xl font-medium text-gray-600">Sự kiện này chưa có đội thi nào</p>
            <p className="text-gray-400 mt-2">Các dự án của đội thi sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <div 
                key={team.teamId}
                onClick={() => navigate(`/judging/hackathon/${hackathonId}/team/${team.teamId}`)}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {team.teamName}
                  </h3>
                  <span className="inline-flex shrink-0 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                    {team.category}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dự án</span>
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {team.projectName || <span className="text-gray-400 italic font-normal">Chưa cập nhật tên</span>}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Mô tả ngắn</span>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {team.projectDescription || <span className="text-gray-400 italic">Không có mô tả</span>}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-3">
                    {team.githubUrl ? (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Có GitHub</span>
                    ) : null}
                    {team.demoVideoUrl ? (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Có Demo</span>
                    ) : null}
                    {team.fileUrl ? (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">Có PDF</span>
                    ) : null}
                  </div>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:underline">
                    Chấm điểm <ExternalLink size={16} className="ml-1.5" />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTeams.length === 0 && teams.length > 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    Không tìm thấy dự án nào phù hợp với từ khóa "{searchQuery}"
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
