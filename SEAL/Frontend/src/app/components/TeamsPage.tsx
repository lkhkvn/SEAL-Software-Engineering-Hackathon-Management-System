import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Trophy, Code, Target, Loader2, X,
  Github, Video, FileText, User, Plus, LogIn, Sparkles,
  Copy, Check, AlertCircle, Crown, Shield, Hash
} from 'lucide-react';

const API = 'http://localhost:8000/index.php/api';

// ────────── helpers ──────────
function getToken() { return localStorage.getItem('auth_token') || ''; }

function parseJwt(token: string): any {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
}

function getAvatarGradient(id: number) {
  const g = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#f7971e,#ffd200)',
  ];
  return g[id % g.length];
}

// ────────── Types ──────────
interface Team {
  id: number;
  name: string;
  members: number;
  maxMembers: number;
  category: string;
  status: string;
  joinCode: string;
  leaderName: string;
  score: number;
  tech: string[];
  project: { name: string; description: string; githubUrl: string; demoVideoUrl: string } | null;
}

// ────────── Sub-components ──────────
function StatChip({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl border ${accent ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`flex items-center gap-1 text-sm font-bold ${accent ? 'text-blue-700' : 'text-gray-800'}`}>{icon}{value}</span>
    </div>
  );
}

// ────────── Modal: Tạo đội ──────────
function CreateTeamModal({ onClose, onCreated }: { onClose: () => void; onCreated: (res: any) => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('AI & ML');
  const [maxMembers, setMaxMembers] = useState(5);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['AI & ML', 'Web Development', 'Mobile App', 'Blockchain', 'IoT', 'Game Dev', 'Khác'];

  const PRESET_SKILLS = [
    'React', 'Vue.js', 'Angular', 'Next.js',
    'Node.js', 'Express', 'Laravel', 'Django', 'Spring Boot',
    'Python', 'TypeScript', 'Java', 'Go', 'Rust',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Firebase',
    'TensorFlow', 'PyTorch', 'Flutter', 'React Native',
    'Solidity', 'Arduino',
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const s = customSkill.trim();
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s]);
    }
    setCustomSkill('');
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập tên đội.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim(), category, max_members: maxMembers, skills: selectedSkills }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      onCreated(data.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo đội. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tạo Đội Mới</h2>
                <p className="text-blue-100 text-xs mt-0.5">Bạn sẽ trở thành Đội trưởng</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tên đội */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đội <span className="text-red-500">*</span></label>
            <input
              id="team-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Alpha Coders, TechVision..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục / Lĩnh vực <span className="text-red-500">*</span></label>
            <select
              id="team-category-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Số lượng thành viên */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số lượng thành viên tối đa <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxMembers}
              onChange={e => setMaxMembers(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Công nghệ sử dụng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Code size={14} className="text-blue-600" />
              Công nghệ sử dụng
              <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
            </label>

            {/* Selected tags */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                {selectedSkills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-blue-200 transition-colors">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_SKILLS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSkills.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                placeholder="Nhập công nghệ khác rồi nhấn Enter..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-xl text-xs font-semibold transition-colors"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              Hủy
            </button>
            <button
              id="create-team-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? 'Đang tạo...' : 'Tạo đội'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────── Modal: Kết quả tạo đội (hiện invite code) ──────────
function InviteCodeModal({ data, onClose }: { data: { teamId: number; teamName: string; joinCode: string }; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(data.joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-center">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Đội đã được tạo! 🎉</h2>
          <p className="text-green-100 text-sm mt-1">Bạn là Đội trưởng của <strong>{data.teamName}</strong></p>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">Chia sẻ mã mời dưới đây để các thành viên tham gia đội của bạn:</p>

          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 mb-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Mã Mời (Invite Code)</p>
            <p className="text-3xl font-black text-gray-900 tracking-[0.2em] font-mono">{data.joinCode}</p>
          </div>

          <button
            id="copy-invite-code-btn"
            onClick={copyCode}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Đã sao chép!' : 'Sao chép mã mời'}
          </button>

          <button onClick={onClose} className="w-full mt-3 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────── Modal: Tham gia đội ──────────
function JoinTeamModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Vui lòng nhập mã mời.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/teams/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ joinCode: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      onJoined();
    } catch (err: any) {
      setError(err.message || 'Mã mời không hợp lệ hoặc đội đã đầy.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <LogIn className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tham Gia Đội</h2>
                <p className="text-purple-100 text-xs mt-0.5">Nhập mã mời từ Đội trưởng</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã mời (Invite Code) <span className="text-red-500">*</span></label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="join-code-input"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="VD: AL1234"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-base font-mono tracking-widest text-center uppercase font-bold"
                maxLength={8}
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm">
              Hủy
            </button>
            <button
              id="join-team-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Đang xử lý...' : 'Tham gia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────── Modal: Xem chi tiết đội ──────────
function TeamDetailModal({ team, onClose }: { team: Team; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-28 relative flex items-end p-5" style={{ background: getAvatarGradient(team.id) }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-3xl font-black text-gray-700">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div className="pb-1">
              <h3 className="text-2xl font-bold text-white drop-shadow">{team.name}</h3>
              <p className="text-white/80 text-xs font-medium">{team.category}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 p-4 border-b border-gray-100">
          <StatChip icon={<Users size={13} />} label="Thành viên" value={`${team.members}/${team.maxMembers}`} />
          <StatChip icon={<Target size={13} />} label="Điểm" value={team.score > 0 ? team.score : 'Chưa có'} />
          <StatChip icon={<Hash size={13} />} label="Mã mời" value={<span className="font-mono">{team.joinCode}</span>} accent />
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Trưởng nhóm */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Crown size={12} className="text-yellow-500" /> Đội trưởng
            </p>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
              <User size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-800">{team.leaderName || 'Chưa xác định'}</span>
            </div>
          </div>

          {/* Công nghệ */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Code size={12} /> Công nghệ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {team.tech.map((t, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">{t}</span>
              ))}
            </div>
          </div>

          {/* Dự án */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Shield size={12} /> Dự án
            </p>
            {team.project ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 space-y-2">
                <p className="font-bold text-gray-900">{team.project.name}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{team.project.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {team.project.githubUrl && (
                    <a href={team.project.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors">
                      <Github size={13} /> Mã nguồn
                    </a>
                  )}
                  {team.project.demoVideoUrl && (
                    <a href={team.project.demoVideoUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                      <Video size={13} /> Demo
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2">
                <FileText className="text-gray-300" size={28} />
                <span className="text-sm text-gray-400">Chưa nộp sản phẩm dự án</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────── Main Component ──────────
export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteResult, setInviteResult] = useState<any | null>(null);

  const [isLookingForTeam, setIsLookingForTeam] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);

  const token = getToken();
  const payload = parseJwt(token);
  const userRole: string = payload.role || '';
  const isParticipant = !!token; // Hiện nút cho bất kỳ user đã đăng nhập

  const fetchTeams = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/teams`);
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message || 'Lỗi tải dữ liệu.');
      setTeams(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối máy chủ.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleToggleAutoMatch = async () => {
    setToggling(true);
    try {
      const newStatus = !isLookingForTeam;
      const res = await fetch(`${API}/teams/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isLookingForTeam: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      setIsLookingForTeam(newStatus);
      setMatchResult(newStatus && data.match ? data.match : null);
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống');
    } finally { setToggling(false); }
  };

  const handleCreated = (result: any) => {
    setShowCreate(false);
    setInviteResult(result);
    fetchTeams();
  };

  const handleJoined = () => {
    setShowJoin(false);
    alert('🎉 Tham gia đội thành công! Danh sách đội sẽ được làm mới.');
    fetchTeams();
  };

  const sorted = [...teams].sort((a, b) => b.score - a.score).map((t, i) => ({ ...t, rank: i + 1 }));
  const filtered = sorted.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
        <span className="text-sm text-gray-500 font-medium">Đang tải danh sách đội thi...</span>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow border border-gray-200 p-6 text-center">
          <div className="text-red-500 font-bold text-xl mb-2">Lỗi tải dữ liệu</div>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button onClick={fetchTeams} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đội Thi</h1>
              <p className="text-gray-500 text-sm mt-1">{teams.length} đội đang tham gia</p>
            </div>

            {/* Action buttons for participants */}
            {isParticipant && (
              <div className="flex gap-2">
                <button
                  id="join-team-btn"
                  onClick={() => setShowJoin(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-violet-200 text-violet-700 rounded-xl hover:bg-violet-50 font-semibold text-sm transition-colors"
                >
                  <LogIn size={16} /> Tham gia đội
                </button>
                <button
                  id="create-team-btn"
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm"
                >
                  <Plus size={16} /> Tạo đội mới
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="team-search-input"
              type="text"
              placeholder="Tìm kiếm đội thi theo tên hoặc lĩnh vực..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
            />
          </div>

          {/* Auto-match toggle (Participants only) */}
          {isParticipant && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={16} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 text-sm">Chế độ Ghép đội Tự động (Auto-Match)</h3>
                  <p className="text-xs text-blue-600 mt-0.5">Bật để hệ thống gợi ý đội đang thiếu thành viên phù hợp với kỹ năng của bạn.</p>
                  {matchResult && (
                    <p className="text-xs text-green-700 font-semibold mt-1.5">
                      ✨ Gợi ý: Tham gia đội <strong>{matchResult.teamName}</strong> — xin mã mời từ Đội trưởng.
                    </p>
                  )}
                </div>
              </div>
              <button
                id="auto-match-toggle-btn"
                onClick={handleToggleAutoMatch}
                disabled={toggling}
                className={`shrink-0 px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  isLookingForTeam
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                {toggling ? <Loader2 size={14} className="animate-spin inline" /> : null}
                {toggling ? ' Đang xử lý...' : isLookingForTeam ? 'Tắt tìm đội' : 'Bật tìm đội'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="text-gray-300 mx-auto mb-3" size={48} />
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Không tìm thấy đội thi nào phù hợp.' : 'Chưa có đội thi nào. Hãy tạo đội đầu tiên!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(team => (
              <div
                key={team.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-0.5 group"
              >
                {/* Card Banner */}
                <div className="h-20 flex items-center justify-center relative" style={{ background: getAvatarGradient(team.id) }}>
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md text-2xl font-black text-gray-700">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  {team.rank <= 3 && (
                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow ${
                      team.rank === 1 ? 'bg-yellow-400 text-yellow-900'
                      : team.rank === 2 ? 'bg-gray-300 text-gray-700'
                      : 'bg-orange-300 text-orange-800'
                    }`}>
                      #{team.rank}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{team.name}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Users size={13} />
                      <span><span className="font-semibold text-gray-800">{team.members}/{team.maxMembers}</span> thành viên — Trưởng nhóm: <span className="font-semibold text-gray-800">{team.leaderName || 'N/A'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Trophy size={13} />
                      <span>{team.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Target size={13} className="text-green-600" />
                      <span className={`font-bold ${team.score > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {team.score > 0 ? `${team.score} điểm` : 'Chưa chấm điểm'}
                      </span>
                    </div>
                  </div>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {team.tech.slice(0, 3).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold border border-blue-100">{t}</span>
                    ))}
                    {team.tech.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[11px] font-semibold">+{team.tech.length - 3}</span>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-semibold text-sm group-hover:shadow-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {showJoin && <JoinTeamModal onClose={() => setShowJoin(false)} onJoined={handleJoined} />}
      {inviteResult && <InviteCodeModal data={inviteResult} onClose={() => { setInviteResult(null); }} />}
      {selectedTeam && <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
    </div>
  );
}
