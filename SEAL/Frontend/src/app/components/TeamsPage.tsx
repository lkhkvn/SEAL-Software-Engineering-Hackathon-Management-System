import { useState } from 'react';
import { Users, Search, Trophy, Code, Target } from 'lucide-react';

export function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const teams = [
    {
      id: 1,
      name: 'AI Innovators',
      members: 5,
      event: 'AI Innovation Hackathon 2026',
      tech: ['Python', 'TensorFlow', 'React'],
      score: 95,
      rank: 1,
      avatar: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      name: 'Code Warriors',
      members: 4,
      event: 'AI Innovation Hackathon 2026',
      tech: ['Node.js', 'MongoDB', 'Vue.js'],
      score: 92,
      rank: 2,
      avatar: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      name: 'Tech Titans',
      members: 5,
      event: 'FinTech Challenge',
      tech: ['Java', 'Spring', 'Angular'],
      score: 90,
      rank: 3,
      avatar: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 4,
      name: 'Digital Nomads',
      members: 3,
      event: 'Green Tech Hackathon',
      tech: ['Go', 'PostgreSQL', 'Svelte'],
      score: 88,
      rank: 4,
      avatar: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      id: 5,
      name: 'Byte Builders',
      members: 5,
      event: 'Healthcare Innovation',
      tech: ['Python', 'FastAPI', 'React Native'],
      score: 87,
      rank: 5,
      avatar: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
      id: 6,
      name: 'Cloud Ninjas',
      members: 4,
      event: 'AI Innovation Hackathon 2026',
      tech: ['Rust', 'WebAssembly', 'Next.js'],
      score: 85,
      rank: 6,
      avatar: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
  ];

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh sách đội thi</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm đội thi..."
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
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{ background: team.avatar }}
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Users className="text-gray-700" size={32} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
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
                    <span>{team.members} thành viên</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Trophy size={16} />
                    <span className="line-clamp-1">{team.event}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Target size={16} />
                    <span>Điểm số: {team.score}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Code size={16} />
                    <span>Công nghệ:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.tech.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy đội thi nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
