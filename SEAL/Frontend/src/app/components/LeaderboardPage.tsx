import { useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, Code } from 'lucide-react';

export function LeaderboardPage() {
  const [selectedEvent, setSelectedEvent] = useState('all');

  const events = [
    { id: 'all', name: 'Tất cả sự kiện' },
    { id: '1', name: 'AI Innovation Hackathon 2026' },
    { id: '2', name: 'FinTech Challenge' },
    { id: '3', name: 'Green Tech Hackathon' },
  ];

  const leaderboard = [
    {
      rank: 1,
      team: 'AI Innovators',
      event: 'AI Innovation Hackathon 2026',
      score: 95,
      innovation: 28,
      technical: 24,
      presentation: 18,
      feasibility: 25,
      members: 5,
      tech: ['Python', 'TensorFlow', 'React'],
    },
    {
      rank: 2,
      team: 'Code Warriors',
      event: 'AI Innovation Hackathon 2026',
      score: 92,
      innovation: 27,
      technical: 23,
      presentation: 19,
      feasibility: 23,
      members: 4,
      tech: ['Node.js', 'MongoDB', 'Vue.js'],
    },
    {
      rank: 3,
      team: 'Tech Titans',
      event: 'FinTech Challenge',
      score: 90,
      innovation: 26,
      technical: 23,
      presentation: 18,
      feasibility: 23,
      members: 5,
      tech: ['Java', 'Spring', 'Angular'],
    },
    {
      rank: 4,
      team: 'Digital Nomads',
      event: 'Green Tech Hackathon',
      score: 88,
      innovation: 25,
      technical: 22,
      presentation: 17,
      feasibility: 24,
      members: 3,
      tech: ['Go', 'PostgreSQL', 'Svelte'],
    },
    {
      rank: 5,
      team: 'Byte Builders',
      event: 'AI Innovation Hackathon 2026',
      score: 87,
      innovation: 26,
      technical: 21,
      presentation: 17,
      feasibility: 23,
      members: 5,
      tech: ['Python', 'FastAPI', 'React Native'],
    },
    {
      rank: 6,
      team: 'Cloud Ninjas',
      event: 'FinTech Challenge',
      score: 85,
      innovation: 24,
      technical: 22,
      presentation: 16,
      feasibility: 23,
      members: 4,
      tech: ['Rust', 'WebAssembly', 'Next.js'],
    },
  ];

  const filteredLeaderboard = selectedEvent === 'all'
    ? leaderboard
    : leaderboard.filter((entry) => entry.event === events.find((e) => e.id === selectedEvent)?.name);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return Trophy;
    if (rank === 2) return Medal;
    if (rank === 3) return Award;
    return TrendingUp;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Bảng xếp hạng</h1>
          <p className="text-blue-100 text-lg">
            Theo dõi thành tích và xếp hạng của các đội thi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo sự kiện
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

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
                      <div className="text-sm text-gray-500">điểm</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.team}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-1">{entry.event}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-gray-600">Sáng tạo</div>
                      <div className="font-bold text-blue-600">{entry.innovation}/30</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-gray-600">Kỹ thuật</div>
                      <div className="font-bold text-green-600">{entry.technical}/25</div>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-gray-600">Trình bày</div>
                      <div className="font-bold text-purple-600">{entry.presentation}/20</div>
                    </div>
                    <div className="bg-orange-50 rounded p-2">
                      <div className="text-gray-600">Khả thi</div>
                      <div className="font-bold text-orange-600">{entry.feasibility}/25</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                    Sự kiện
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Sáng tạo
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Kỹ thuật
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Trình bày
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Khả thi
                  </th>
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
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{entry.event}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{entry.innovation}</span>
                      <span className="text-xs text-gray-500">/30</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{entry.technical}</span>
                      <span className="text-xs text-gray-500">/25</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.presentation}
                      </span>
                      <span className="text-xs text-gray-500">/20</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{entry.feasibility}</span>
                      <span className="text-xs text-gray-500">/25</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-blue-600">{entry.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
