import { useState, useEffect } from 'react';
import { Loader2, Save, CheckCircle, Search, Filter } from 'lucide-react';

interface Team {
  teamId: number;
  teamName: string;
  category: string;
  projectName: string | null;
  projectDescription: string | null;
  githubUrl: string | null;
  demoVideoUrl: string | null;
}

interface Criteria {
  id: number;
  name: string;
  max_score: number;
  weight: number;
}

interface ScoreInput {
  criteria_id: number;
  score: number;
  feedback: string;
}

export function JudgingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [scores, setScores] = useState<Record<number, ScoreInput>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        
        setTeams(result.data.teams || []);
        setCriteria(result.data.criteria || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleScoreChange = (criteriaId: number, value: number) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        criteria_id: criteriaId,
        score: value
      }
    }));
  };

  const handleFeedbackChange = (criteriaId: number, feedback: string) => {
    setScores(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        criteria_id: criteriaId,
        feedback
      }
    }));
  };

  const handleSubmitScore = async () => {
    if (!selectedTeam) return;
    
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/index.php/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: selectedTeam.teamId,
          scores: Object.values(scores)
        })
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Lỗi khi lưu điểm');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng chấm điểm (Judging)</h1>
          <p className="text-gray-500 mt-2">Chọn đội thi và nhập điểm theo các tiêu chí đã đề ra.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar danh sách đội thi */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm đội thi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {teams.map(team => (
                <button
                  key={team.teamId}
                  onClick={() => {
                    setSelectedTeam(team);
                    setScores({}); // Reset scores when switching team (or fetch existing later)
                    setSaveSuccess(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedTeam?.teamId === team.teamId 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                  }`}
                >
                  <div className="font-semibold">{team.teamName}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{team.category}</div>
                </button>
              ))}
              {teams.length === 0 && (
                <div className="text-center p-6 text-gray-500">Không có đội thi nào</div>
              )}
            </div>
          </div>

          {/* Khu vực nhập điểm */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {selectedTeam.category}
                  </span>
                </div>

                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2">Thông tin dự án</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Tên dự án:</strong> {selectedTeam.projectName || 'Chưa cập nhật'}</p>
                    <p><strong>Mô tả:</strong> {selectedTeam.projectDescription || 'Chưa cập nhật'}</p>
                    {selectedTeam.githubUrl && (
                      <p><strong>GitHub:</strong> <a href={selectedTeam.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedTeam.githubUrl}</a></p>
                    )}
                    {selectedTeam.demoVideoUrl && (
                      <p><strong>Demo Video:</strong> <a href={selectedTeam.demoVideoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{selectedTeam.demoVideoUrl}</a></p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900">Phiếu chấm điểm</h3>
                  {criteria.map(crit => (
                    <div key={crit.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">{crit.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">Trọng số: {crit.weight} | Điểm tối đa: {crit.max_score}</p>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="0"
                            max={crit.max_score}
                            step="0.5"
                            placeholder="Điểm"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-center"
                            value={scores[crit.id]?.score || ''}
                            onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder={`Nhận xét về tiêu chí ${crit.name}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-20 resize-none"
                        value={scores[crit.id]?.feedback || ''}
                        onChange={(e) => handleFeedbackChange(crit.id, e.target.value)}
                      ></textarea>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="text-sm font-medium text-gray-700">
                    Tổng điểm ước tính: <span className="text-xl font-bold text-blue-600 ml-2">
                      {Object.values(scores).reduce((sum, item) => sum + (item.score || 0), 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {saveSuccess && (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle size={16} className="mr-1" />
                        Đã lưu thành công!
                      </span>
                    )}
                    <button
                      onClick={handleSubmitScore}
                      disabled={saving || Object.keys(scores).length === 0}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Lưu điểm
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col items-center justify-center text-gray-400">
                <Filter size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium text-gray-500">Chọn một đội thi để bắt đầu chấm điểm</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
