import { useState, useEffect } from 'react';
import { Users, Search, Trophy, Code, Target, Loader2 } from 'lucide-react';

export function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:8000/index.php/api/teams');
        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Không thể tải danh sách đội thi.');
        }
        setTeams(result.data || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const getAvatarGradient = (id: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return gradients[id % gradients.length];
  };

  // Sắp xếp các đội theo điểm để gán rank (hạng) thực tế
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const rankedTeams = sortedTeams.map((team, idx) => ({
    ...team,
    rank: idx + 1
  }));

  const filteredTeams = rankedTeams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
        <span className="text-sm text-gray-500 font-medium">Đang tải danh sách đội thi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
          <div className="text-red-500 text-3xl font-bold mb-2">Lỗi tải dữ liệu</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh sách đội thi</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đội thi theo tên hoặc danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:-translate-y-0.5"
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{ background: getAvatarGradient(team.id) }}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow">
                  <Users className="text-gray-700" size={32} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{team.name}</h3>
                  {team.rank <= 3 && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        team.rank === 1
                          ? 'bg-yellow-100 text-yellow-700'
                          : team.rank === 2
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      #{team.rank}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users size={16} />
                    <span>{team.members} thành viên (Trưởng nhóm: {team.leaderName || 'N/A'})</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Trophy size={16} />
                    <span className="line-clamp-1">Danh mục: {team.category}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Target size={16} />
                    <span className="font-semibold text-gray-950">Điểm số: {team.score > 0 ? `${team.score} / 100` : 'Chưa chấm điểm'}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Code size={16} />
                    <span>Công nghệ sử dụng:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.tech.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-medium text-sm shadow-sm">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đội thi nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
