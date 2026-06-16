import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Save, CheckCircle, ArrowLeft } from 'lucide-react';

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

export function JudgingDetailPage() {
  const { teamId, hackathonId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [scores, setScores] = useState<Record<number, ScoreInput>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
        
        const teams: Team[] = result.data.teams || [];
        const foundTeam = teams.find(t => t.teamId === Number(teamId) && t.contestId === Number(hackathonId));
        
        if (!foundTeam) {
            throw new Error('Không tìm thấy thông tin dự án!');
        }

        setTeam(foundTeam);
        setCriteria(result.data.criteria || []);
      } catch (err: any) {
        setError(err.message || 'Lỗi kết nối máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teamId, hackathonId]);

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
    if (!team) return;
    
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
          teamId: team.teamId,
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

  if (error || !team) {
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
            <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-6 border border-red-200 shadow-sm max-w-md w-full text-center">
                <p className="font-medium text-lg mb-4">{error || 'Đội thi không tồn tại.'}</p>
                <button 
                    onClick={() => navigate(`/judging/hackathon/${hackathonId}`)}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button 
            onClick={() => navigate(`/judging/hackathon/${hackathonId}`)}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách đội thi
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="border-b border-gray-200 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{team.teamName}</h2>
                <span className="inline-block mt-3 px-4 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {team.category}
                </span>
            </div>

            <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin dự án</h3>
                <div className="space-y-4 text-gray-700">
                <p>
                    <span className="font-semibold text-gray-900 w-32 inline-block">Tên dự án:</span> 
                    {team.projectName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                </p>
                <p>
                    <span className="font-semibold text-gray-900 w-32 inline-block align-top">Mô tả:</span> 
                    <span className="inline-block w-[calc(100%-8rem)]">{team.projectDescription || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
                </p>
                {team.githubUrl && (
                    <p>
                        <span className="font-semibold text-gray-900 w-32 inline-block">GitHub:</span> 
                        <a href={team.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{team.githubUrl}</a>
                    </p>
                )}
                {team.demoVideoUrl && (
                    <p>
                        <span className="font-semibold text-gray-900 w-32 inline-block">Demo Video:</span> 
                        <a href={team.demoVideoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{team.demoVideoUrl}</a>
                    </p>
                )}
                {team.fileUrl && (
                    <p>
                        <span className="font-semibold text-gray-900 w-32 inline-block">Tài liệu đính kèm:</span> 
                        <a href={`http://localhost:8000${team.fileUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem / Tải xuống (PDF)</a>
                    </p>
                )}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Phiếu chấm điểm</h3>
                {criteria.map(crit => (
                <div key={crit.id} className="p-6 border border-gray-200 rounded-xl bg-white hover:border-blue-300 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                    <div>
                        <h4 className="text-lg font-bold text-gray-800">{crit.name}</h4>
                        <div className="flex gap-4 mt-2">
                            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">Trọng số: {crit.weight}</span>
                            <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">Điểm tối đa: {crit.max_score}</span>
                        </div>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nhập điểm</label>
                        <input
                        type="number"
                        min="0"
                        max={crit.max_score}
                        step="0.5"
                        placeholder="0.0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold text-center"
                        value={scores[crit.id]?.score || ''}
                        onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                        />
                    </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét (Feedback)</label>
                        <textarea
                        placeholder={`Chi tiết nhận xét về tiêu chí ${crit.name}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-24 resize-none"
                        value={scores[crit.id]?.feedback || ''}
                        onChange={(e) => handleFeedbackChange(crit.id, e.target.value)}
                        ></textarea>
                    </div>
                </div>
                ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-4">
                <div className="text-lg font-medium text-gray-700 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
                Tổng điểm ước tính:{' '}
                <span className="text-2xl font-bold text-blue-600 ml-2">
                    {Object.values(scores).reduce((sum, item) => sum + (item.score || 0), 0)}
                </span>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                {saveSuccess && (
                    <span className="flex items-center text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle size={20} className="mr-2" />
                    Đã lưu thành công!
                    </span>
                )}
                <button
                    onClick={handleSubmitScore}
                    disabled={saving || Object.keys(scores).length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    Lưu điểm
                </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
