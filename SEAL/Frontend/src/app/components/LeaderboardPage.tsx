import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Code, Loader2, Download } from 'lucide-react';

interface LeaderboardProps {
  contestId?: string;
}

export function LeaderboardPage({ contestId }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const url = contestId 
          ? `http://localhost:8000/index.php/api/leaderboard?contestId=${contestId}`
          : 'http://localhost:8000/index.php/api/leaderboard';
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Không thể tải bảng xếp hạng.');
        }
        setLeaderboard(result.data || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  // Lọc danh mục động từ dữ liệu thật
  const categories = ['all', ...Array.from(new Set(leaderboard.map(item => item.category)))];

  const dynamicCriteria = leaderboard.length > 0 && leaderboard[0].criteriaScores 
    ? leaderboard[0].criteriaScores 
    : [];

  const filteredLeaderboard = selectedCategory === 'all'
    ? leaderboard
    : leaderboard.filter((entry) => entry.category === selectedCategory);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const handleExportCSV = () => {
    const headers = ['Hạng', 'Tên Đội', 'Danh mục', 'Tổng điểm', 'Số thành viên', 'Công nghệ'];
    const rows = filteredLeaderboard.map(team => [
      team.rank,
      `"${team.team}"`,
      `"${team.category}"`,
      team.score,
      team.members,
      `"${team.tech.join(' - ')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Leaderboard_${selectedCategory}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return Trophy;
    if (rank === 2) return Medal;
    if (rank === 3) return Award;
    return TrendingUp;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
        <span className="text-sm text-gray-500 font-medium">Đang tải bảng xếp hạng...</span>
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
    <div className={contestId ? "" : "min-h-screen bg-gray-50"}>
      {!contestId && (
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold mb-4">Bảng xếp hạng</h1>
            <p className="text-blue-100 text-lg">
              Theo dõi thành tích, điểm số chi tiết các tiêu chí và xếp hạng của các đội thi
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Bộ lọc danh mục */}
        <div className="mb-6 flex flex-col sm:flex-row items-end justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo danh mục công nghệ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-gray-700 cursor-pointer shadow-sm"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Tất cả danh mục' : cat}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
          >
            <Download size={18} />
            Xuất CSV
          </button>
        </div>

        {/* Top 3 đội dẫn đầu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredLeaderboard.slice(0, 3).map((entry) => {
            const Icon = getRankIcon(entry.rank);
            return (
              <div
                key={entry.rank}
                className={`relative bg-white rounded-xl overflow-hidden shadow-lg border-2 ${
                  entry.rank === 1
                    ? 'border-yellow-400 md:scale-105'
                    : entry.rank === 2
                    ? 'border-gray-400'
                    : 'border-orange-400'
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${getRankColor(entry.rank)}`}></div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(
                        entry.rank
                      )} flex items-center justify-center text-white`}
                    >
                      <Icon size={32} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{entry.score}</div>
                      <div className="text-xs text-gray-500 font-semibold">điểm</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{entry.team}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-semibold">Danh mục: {entry.category}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {entry.criteriaScores?.map((crit: any, idx: number) => {
                      const colors = [
                        'bg-blue-50 text-blue-600',
                        'bg-green-50 text-green-600',
                        'bg-purple-50 text-purple-600',
                        'bg-orange-50 text-orange-600',
                        'bg-red-50 text-red-600'
                      ];
                      const colorClass = colors[idx % colors.length];
                      const bgClass = colorClass.split(' ')[0];
                      const textClass = colorClass.split(' ')[1];
                      return (
                        <div key={crit.id} className={`${bgClass} rounded p-2`}>
                          <div className="text-gray-600 font-medium">{crit.name}</div>
                          <div className={`font-bold ${textClass}`}>{crit.score}/{crit.max_score}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bảng xếp hạng chi tiết */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Hạng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Đội thi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Danh mục
                  </th>
                  {dynamicCriteria.map((crit: any) => (
                    <th key={crit.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {crit.name}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Tổng điểm
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaderboard.map((entry) => (
                  <tr key={entry.rank} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor(
                            entry.rank
                          )} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {entry.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{entry.team}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{entry.members} thành viên</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Code size={14} className="text-gray-400" />
                        {entry.tech.map((tech, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">{entry.category}</span>
                    </td>
                    {entry.criteriaScores?.map((crit: any) => (
                      <td key={crit.id} className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">{crit.score}</span>
                        <span className="text-xs text-gray-500">/{crit.max_score}</span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-blue-600">{entry.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLeaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đội thi nào phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}
