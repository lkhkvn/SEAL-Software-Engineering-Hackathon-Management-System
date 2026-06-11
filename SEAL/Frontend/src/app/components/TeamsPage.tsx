import { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Trophy, Code, Target, Loader2, X,
  Github, Video, FileText, User, Plus, LogIn, Sparkles,
  Copy, Check, AlertCircle, Crown, Shield, Hash,
  Briefcase, GraduationCap, Link as LinkIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CV_THEMES: Record<string, {
  headerBg: string;
  accentText: string;
  tagBg: string;
  badgeBg: string;
  timelineBorder: string;
}> = {
  ocean: {
    headerBg: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    accentText: 'text-blue-600',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-100',
    badgeBg: 'bg-blue-600 text-white',
    timelineBorder: 'border-blue-200'
  },
  emerald: {
    headerBg: 'linear-gradient(135deg, #059669, #0d9488)',
    accentText: 'text-emerald-600',
    tagBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badgeBg: 'bg-emerald-600 text-white',
    timelineBorder: 'border-emerald-200'
  },
  sunset: {
    headerBg: 'linear-gradient(135deg, #f97316, #e11d48)',
    accentText: 'text-rose-600',
    tagBg: 'bg-rose-50 text-rose-700 border-rose-100',
    badgeBg: 'bg-rose-600 text-white',
    timelineBorder: 'border-rose-200'
  },
  midnight: {
    headerBg: 'linear-gradient(135deg, #1f2937, #111827)',
    accentText: 'text-gray-800',
    tagBg: 'bg-gray-100 text-gray-800 border-gray-200',
    badgeBg: 'bg-gray-900 text-white',
    timelineBorder: 'border-gray-300'
  }
};

function CVViewLayout({ name, email, summary, education, experience, portfolioUrl, theme, skills }: {
  name: string;
  email: string;
  summary: string;
  education: string;
  experience: string;
  portfolioUrl: string;
  theme: string;
  skills: string[];
}) {
  const currentTheme = CV_THEMES[theme] || CV_THEMES.ocean;

  return (
    <div className="bg-white text-gray-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="p-6 text-white" style={{ background: currentTheme.headerBg }}>
        <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
        <p className="text-white/80 text-xs mt-1">{email}</p>
        {portfolioUrl && (
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/90 hover:text-white mt-2 font-medium bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Github size={12} />
            <span>GitHub / Portfolio</span>
          </a>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-5">
          {/* Học vấn */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>Học Vấn</h4>
            <div className="flex gap-2 items-start">
              <GraduationCap size={15} className="text-gray-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                {education || 'Chưa cập nhật trường học.'}
              </p>
            </div>
          </div>

          {/* Kỹ năng */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>Kỹ Năng</h4>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <span key={i} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${currentTheme.tagBg}`}>
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Chưa chọn kỹ năng.</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-5 border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6">
          {/* Giới thiệu */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>Giới Thiệu Bản Thân</h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {summary || 'Chưa cập nhật thông tin giới thiệu bản thân.'}
            </p>
          </div>

          {/* Kinh nghiệm */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${currentTheme.accentText}`}>Kinh Nghiệm & Dự Án</h4>
            {experience ? (
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {experience}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">Chưa cập nhật kinh nghiệm và dự án.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

// ────────── Modal: Thiết lập CV Cá nhân ──────────
function MyCVModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [theme, setTheme] = useState('ocean');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const PRESET_SKILLS = [
    'React', 'Vue.js', 'Angular', 'Next.js',
    'Node.js', 'Express', 'Laravel', 'Django', 'Spring Boot',
    'Python', 'TypeScript', 'Java', 'Go', 'Rust',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Firebase',
  ];

  useEffect(() => {
    const fetchCV = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/users/me/cv`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          const cv = data.data;
          setSummary(cv.summary || '');
          setEducation(cv.education || '');
          setExperience(cv.experience || '');
          setPortfolioUrl(cv.portfolioUrl || '');
          setTheme(cv.theme || 'ocean');
          if (cv.skills) {
            setSelectedSkills(cv.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
          }
        }
      } catch (err) {
        setError('Không thể lấy thông tin CV của bạn.');
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/users/me/cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          summary,
          education,
          experience,
          portfolioUrl,
          theme,
          skills: selectedSkills.join(', ')
        })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      alert('🎉 Lưu thông tin CV thành công!');
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu CV. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shrink-0 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hồ Sơ Năng Lực (CV Cá Nhân)</h2>
              <p className="text-blue-100 text-xs">Cập nhật hồ sơ của bạn để ứng tuyển vào các đội thi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6 py-2 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-2 pt-1 font-semibold text-sm border-b-2 transition-all ${
                activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Thiết kế CV
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`pb-2 pt-1 font-semibold text-sm border-b-2 transition-all ${
                activeTab === 'preview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Xem trước CV (Live Preview)
            </button>
          </div>
          
          {activeTab === 'edit' && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Chủ đề màu:</span>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 bg-white font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ocean">🌊 Ocean Wave</option>
                <option value="emerald">🍃 Emerald Mint</option>
                <option value="sunset">🌅 Sunset Glow</option>
                <option value="midnight">🕶️ Midnight Sleek</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-gray-50">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="text-blue-600 animate-spin" size={36} />
              <span className="text-sm text-gray-500">Đang tải hồ sơ CV...</span>
            </div>
          ) : activeTab === 'edit' ? (
            <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              {/* Giới thiệu bản thân */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User size={15} className="text-blue-600" />
                  Tóm tắt / Giới thiệu bản thân
                </label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="VD: Mình là nhà phát triển Frontend với hơn 1 năm kinh nghiệm phát triển các ứng dụng Web sử dụng React và Tailwind CSS. Có khả năng tự học tốt và sẵn sàng cống hiến..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Học vấn */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap size={16} className="text-blue-600" />
                    Trường học / Học vấn
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    placeholder="VD: Đại học Công nghệ thông tin - ĐHQG TP.HCM"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    maxLength={150}
                  />
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon size={15} className="text-blue-600" />
                    Liên kết cá nhân (Github, Portfolio...)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value)}
                    placeholder="VD: https://github.com/myusername"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Kinh nghiệm và dự án */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Briefcase size={15} className="text-blue-600" />
                  Kinh nghiệm & Dự án nổi bật
                </label>
                <textarea
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Mô tả ngắn gọn về các dự án bạn đã từng làm hoặc kinh nghiệm làm việc thực tế..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Tag kỹ năng */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Code size={15} className="text-blue-600" />
                  Kỹ năng chuyên môn
                </label>
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const s = customSkill.trim();
                        if (s && !selectedSkills.includes(s)) {
                          setSelectedSkills(prev => [...prev, s]);
                        }
                        setCustomSkill('');
                      }
                    }}
                    placeholder="Gõ kỹ năng khác rồi nhấn Enter..."
                    className="flex-1 max-w-xs px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const s = customSkill.trim();
                      if (s && !selectedSkills.includes(s)) {
                        setSelectedSkills(prev => [...prev, s]);
                      }
                      setCustomSkill('');
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors font-semibold text-sm flex items-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Đang lưu...' : 'Lưu & Xem trước'}
                </button>
              </div>
            </form>
          ) : (
            /* Live Preview Layout */
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-md max-w-3xl mx-auto">
              <CVViewLayout
                name={parseJwt(getToken()).name || 'Thí sinh'}
                email={parseJwt(getToken()).email || 'candidate@gmail.com'}
                summary={summary}
                education={education}
                experience={experience}
                portfolioUrl={portfolioUrl}
                theme={theme}
                skills={selectedSkills}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────── Modal: Tham gia đội (Có Skill Matching & Cover Letter) ──────────
function JoinTeamModal({ teams, onClose, onJoined }: { teams: Team[]; onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy kỹ năng của user hiện tại từ CV
  useEffect(() => {
    const fetchUserCV = async () => {
      try {
        const res = await fetch(`${API}/users/me/cv`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (res.ok && data.status === 'success' && data.data.skills) {
          setUserSkills(data.data.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      } catch (err) {
        console.error('Không thể load kỹ năng của ứng viên:', err);
      }
    };
    fetchUserCV();
  }, []);

  // Tìm kiếm đội cục bộ dựa trên mã mời
  const matchedTeam = code.length >= 4 ? teams.find(t => t.joinCode === code.trim().toUpperCase()) : null;

  // Tính toán đối khớp kỹ năng
  const matchingSkills = matchedTeam ? userSkills.filter(s => matchedTeam.tech.some(t => t.toLowerCase() === s.toLowerCase())) : [];
  const missingSkills = matchedTeam ? matchedTeam.tech.filter(t => !userSkills.some(s => s.toLowerCase() === t.toLowerCase())) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError('Vui lòng nhập mã mời.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/teams/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ joinCode: code.trim().toUpperCase(), message }),
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      
      alert('🎉 Gửi đơn ứng tuyển thành công! Vui lòng chờ đội trưởng duyệt.');
      onJoined();
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống khi ứng tuyển.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 shrink-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <LogIn size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ứng Tuyển Vào Đội</h2>
                <p className="text-purple-100 text-xs mt-0.5">Nhập mã mời từ Đội trưởng để gửi CV ứng tuyển</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
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

          {/* Mã mời */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã mời (Invite Code) <span className="text-red-500">*</span></label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="join-code-input"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="VD: UE2383"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-base font-mono tracking-widest text-center uppercase font-bold"
                maxLength={8}
                autoFocus
              />
            </div>
          </div>

          {/* Đối khớp kỹ năng (Skill Matching Panel) */}
          {matchedTeam && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Đội ứng tuyển</span>
                <h4 className="font-bold text-gray-900 text-sm">{matchedTeam.name} ({matchedTeam.category})</h4>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Mức độ tương thích công nghệ (Skill Matching)</span>
                
                {/* Khớp */}
                {matchingSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-green-700 font-semibold shrink-0 mr-1">Khớp:</span>
                    {matchingSkills.map((s, idx) => (
                      <span key={idx} className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Thiếu */}
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-amber-700 font-semibold shrink-0 mr-1">Thiếu:</span>
                    {missingSkills.map((s, idx) => (
                      <span key={idx} className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                    ✨ Tuyệt vời! Bạn có đầy đủ công nghệ nhóm này đang cần.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Thư xin việc / Lời chào */}
          {matchedTeam && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                Lời nhắn gửi đến Đội trưởng <span className="text-xs text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="VD: Chào bạn, mình có kỹ năng về React và mong muốn ứng tuyển vị trí làm Frontend cho dự án..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                maxLength={300}
              />
              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                <FileText size={10} /> Hồ sơ CV cá nhân của bạn sẽ được tự động gửi kèm cùng đơn xin gia nhập này.
              </p>
            </div>
          )}

          {/* Nút bấm */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm">
              Hủy
            </button>
            <button
              id="join-team-submit-btn"
              type="submit"
              disabled={loading || !matchedTeam}
              className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
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

  // States nâng cấp cho CV & Yêu cầu gia nhập
  const [userTeam, setUserTeam] = useState<any | null>(null);
  const [showCV, setShowCV] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any | null>(null);

  const token = getToken();
  const payload = parseJwt(token);
  const userRole: string = payload.role || '';
  const isParticipant = !!token && userRole === 'PARTICIPANT';

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

  const fetchUserTeam = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/users/me/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setUserTeam(data.data);
      }
    } catch (err) {
      console.error('Lỗi lấy thông tin đội của người dùng:', err);
    }
  }, [token]);

  const fetchRequests = useCallback(async () => {
    if (!token || !userTeam?.isLeader) return;
    setLoadingRequests(true);
    try {
      const res = await fetch(`${API}/teams/my-team/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách yêu cầu ứng tuyển:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [token, userTeam]);

  useEffect(() => {
    fetchTeams();
    fetchUserTeam();
  }, [fetchTeams, fetchUserTeam]);

  useEffect(() => {
    if (userTeam?.isLeader) {
      fetchRequests();
    }
  }, [userTeam, fetchRequests]);

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
    fetchUserTeam();
    fetchTeams();
  };

  const handleJoined = () => {
    setShowJoin(false);
    fetchUserTeam();
    fetchTeams();
  };

  const handleApproveRequest = async (requestId: number, userName: string) => {
    try {
      const res = await fetch(`${API}/teams/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      alert(`🎉 Đã nhận ${userName} vào đội thi thành công!`);
      fetchUserTeam();
      fetchTeams();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi duyệt yêu cầu.');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối ứng viên này không?')) return;
    try {
      const res = await fetch(`${API}/teams/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') throw new Error(data.message);
      
      alert('Đã từ chối đơn ứng tuyển.');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối yêu cầu.');
    }
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
              <div className="flex gap-2 items-center">
                <button
                  id="my-cv-btn"
                  onClick={() => setShowCV(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors shadow-sm"
                >
                  <FileText size={16} className="text-blue-600" /> Hồ sơ CV của tôi
                </button>

                {!userTeam ? (
                  <>
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
                  </>
                ) : (
                  <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl flex items-center gap-1.5">
                    {userTeam.isLeader ? <Crown size={15} className="text-yellow-500" /> : <User size={15} className="text-blue-500" />}
                    <span>Đã tham gia: {userTeam.name}</span>
                  </div>
                )}
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
          {isParticipant && !userTeam && (
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

      {/* Join Requests Section for Team Leaders */}
      {userTeam?.isLeader && requests.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              Đơn Gia Nhập Đội Đang Chờ Duyệt ({requests.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(req => {
                const reqSkills = req.userSkills ? req.userSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                const myTeamData = teams.find(t => t.id === userTeam.id);
                const matchingSkillsCount = myTeamData ? reqSkills.filter((s: string) => myTeamData.tech.some(t => t.toLowerCase() === s.toLowerCase())).length : 0;
                const totalTeamSkills = myTeamData ? myTeamData.tech.length : 0;

                return (
                  <div key={req.requestId} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-800 text-sm">{req.userName}</span>
                        {totalTeamSkills > 0 && (
                          <span className="text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                            Khớp {matchingSkillsCount}/{totalTeamSkills} công nghệ
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mb-2 truncate">{req.userEmail}</p>
                      {req.message && (
                        <p className="text-xs text-gray-600 bg-white border border-gray-100 p-2.5 rounded-lg mb-3 italic">
                          "{req.message}"
                        </p>
                      )}
                      
                      {/* Candidate Skills */}
                      {reqSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {reqSkills.slice(0, 4).map((s: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-200/60 mt-auto">
                      <button
                        onClick={() => setSelectedCV(req)}
                        className="flex-1 py-1.5 text-xs bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Xem CV
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.requestId)}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-100 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req.requestId, req.userName)}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Đồng ý
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
      {showJoin && <JoinTeamModal teams={teams} onClose={() => setShowJoin(false)} onJoined={handleJoined} />}
      {inviteResult && <InviteCodeModal data={inviteResult} onClose={() => { setInviteResult(null); }} />}
      {selectedTeam && <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
      {showCV && <MyCVModal onClose={() => setShowCV(false)} />}

      {/* Modal: Xem CV Ứng Viên */}
      {selectedCV && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-gray-900 p-5 shrink-0 flex items-center justify-between text-white">
              <h3 className="text-lg font-bold">Hồ sơ ứng viên: {selectedCV.userName}</h3>
              <button onClick={() => setSelectedCV(null)} className="text-white/70 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <CVViewLayout
                  name={selectedCV.userName}
                  email={selectedCV.userEmail}
                  summary={selectedCV.cvSummary || ''}
                  education={selectedCV.cvEducation || ''}
                  experience={selectedCV.cvExperience || ''}
                  portfolioUrl={selectedCV.cvPortfolioUrl || ''}
                  theme={selectedCV.cvTheme || 'ocean'}
                  skills={selectedCV.userSkills ? selectedCV.userSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : []}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex gap-2 justify-end bg-white">
              <button
                onClick={() => setSelectedCV(null)}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const reqId = selectedCV.requestId;
                  setSelectedCV(null);
                  handleRejectRequest(reqId);
                }}
                className="px-5 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm"
              >
                Từ chối
              </button>
              <button
                onClick={() => {
                  const reqId = selectedCV.requestId;
                  const name = selectedCV.userName;
                  setSelectedCV(null);
                  handleApproveRequest(reqId, name);
                }}
                className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-sm"
              >
                Đồng ý nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
