import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Users,
  Trophy,
  BarChart3,
  Settings as SettingsIcon,
  Eye,
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  Trash2,
  X,
  MapPin,
  Tag,
  Hash,
  Clock,
  Award,
  FileText,
  BookOpen,
  Send,
  Lock,
  Unlock,
  PlayCircle,
  UploadCloud
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface AdminPageProps {
  currentUser: any;
  onLogout?: () => void;
}

interface Hackathon {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationStart: string;
  registrationEnd: string;
  maxTeams: number;
  status: string;
  organizer?: string;
  schedule?: string;
  prizeDetails?: string;
  rules?: string;
  criteria?: string;
  registrationDeadline?: string;
}

interface Milestone {
  id: number;
  hackathonId: number;
  name: string;
  description: string;
  dueDate: string;
}

interface Schedule {
  id: number;
  hackathonId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

const EMPTY_FORM: Omit<Hackathon, 'id'> = {
  name: '',
  category: 'AI & ML',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  registrationStart: '',
  registrationEnd: '',
  registrationDeadline: '',
  maxTeams: 50,
  status: 'UPCOMING',
  organizer: '',
  schedule: '',
  prizeDetails: '',
  rules: '',
  criteria: '',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700 border-green-200',
  UPCOMING:  'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-gray-100 text-gray-600 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    'Đang diễn ra',
  UPCOMING:  'Sắp diễn ra',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã huỷ',
};

const CATEGORIES = ['AI & ML', 'FinTech', 'Healthcare', 'Education', 'Blockchain', 'Sustainability', 'Gaming', 'Khác'];

export function AdminPage({ currentUser, onLogout }: AdminPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ── Nhật ký hoạt động ──
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsSearchTerm, setLogsSearchTerm] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('');
  const [logsTypeFilter, setLogsTypeFilter] = useState('');

  // ── Phân quyền ──
  const [users, setUsers]               = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError]       = useState<string | null>(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // ── Hackathons ──
  const [contests, setContests]         = useState<Hackathon[]>([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  const [contestSearch, setContestSearch] = useState('');

  // Modal tạo / chỉnh sửa
  const [showModal, setShowModal]       = useState(false);
  const [editingContest, setEditingContest] = useState<Hackathon | null>(null);
  const [formData, setFormData]         = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);

  // Confirm xoá
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Hackathon | null>(null);

  // ── Quản lý Đội thi ──
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [selectedHackathonForTeams, setSelectedHackathonForTeams] = useState<Hackathon | null>(null);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [removingTeamId, setRemovingTeamId] = useState<number | null>(null);
  const [processingRegId, setProcessingRegId] = useState<number | null>(null);

  // Tạo tài khoản Giám Khảo
  const [showCreateJudgeModal, setShowCreateJudgeModal] = useState(false);
  const [judgeForm, setJudgeForm] = useState({ username: '', email: '', password: '' });
  const [submittingJudge, setSubmittingJudge] = useState(false);

  // Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Milestones & Schedules & Challenge Management State ──
  const [selectedHackathonForTimeline, setSelectedHackathonForTimeline] = useState<Hackathon | null>(null);
  const [activeTimelineTab, setActiveTimelineTab] = useState<'milestones' | 'schedules' | 'challenge'>('milestones');
  
  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', dueDate: '' });
  
  // Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ title: '', description: '', startTime: '', endTime: '', location: '' });

  // Challenge (Đề bài)
  const [challenge, setChallenge] = useState<any>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [releasingChallenge, setReleasingChallenge] = useState(false);
  const [savingChallenge, setSavingChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    resources: '',
    constraints: '',
    criteriaItems: [{ name: '', weight: 30 }],
  });

  // ── Criteria Management ──
  const [criteriaList, setCriteriaList] = useState<any[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [submittingCriteria, setSubmittingCriteria] = useState(false);
  const [criteriaForm, setCriteriaForm] = useState({ name: '', weight: 20, maxScore: 10 });

  // ── Judging Assignments ──
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [selectedJudgeForAssignments, setSelectedJudgeForAssignments] = useState<any | null>(null);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  const isAdmin = currentUser && currentUser.role?.toUpperCase() === 'ADMIN';

  const toast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Fetch users, criteria, assignments & teams ──
  useEffect(() => {
    if (activeTab === 'permissions' && isAdmin) {
      fetchUsers();
      fetchAssignments();
      fetchTeams();
    }
    if (activeTab === 'settings' && isAdmin) {
      fetchCriteria();
    }
    if (activeTab === 'logs' && isAdmin) {
      fetchLogs();
    }
  }, [activeTab, isAdmin]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setLogs(result.data || []);
      }
    } catch (e) {
      console.error('Lỗi tải nhật ký hoạt động:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchCriteria = async () => {
    setLoadingCriteria(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/criteria', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setCriteriaList(result.data || []);
      }
    } catch (e) {
      console.error('Lỗi tải tiêu chí:', e);
    } finally {
      setLoadingCriteria(false);
    }
  };

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteriaForm.name.trim() || criteriaForm.weight <= 0) {
      toast('error', 'Vui lòng nhập tên tiêu chí và trọng số hợp lệ.');
      return;
    }
    setSubmittingCriteria(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: criteriaForm.name,
          weight: criteriaForm.weight / 100, // decimal weight
          maxScore: criteriaForm.maxScore
        })
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Thêm tiêu chí chấm điểm mới thành công!');
      setCriteriaForm({ name: '', weight: 20, maxScore: 10 });
      fetchCriteria();
    } catch (e: any) {
      toast('error', e.message || 'Không thể thêm tiêu chí.');
    } finally {
      setSubmittingCriteria(false);
    }
  };

  const handleDeleteCriteria = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tiêu chí chấm điểm này?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/criteria/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã xóa tiêu chí chấm điểm thành công!');
      fetchCriteria();
    } catch (e: any) {
      toast('error', e.message || 'Không thể xóa tiêu chí.');
    }
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setAssignments(result.data || []);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách phân công:', e);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('http://localhost:8000/index.php/api/teams');
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setTeamsList(result.data || []);
      }
    } catch (e) {
      console.error('Lỗi tải danh sách đội thi:', e);
    }
  };

  const handleToggleAssignment = async (judgeId: number, teamId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/assignments/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ judgeId, teamId })
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setAssignments(prev => {
          const exists = prev.some(a => Number(a.judgeId) === judgeId && Number(a.teamId) === teamId);
          if (exists) {
            return prev.filter(a => !(Number(a.judgeId) === judgeId && Number(a.teamId) === teamId));
          } else {
            return [...prev, { judgeId, teamId }];
          }
        });
        toast('success', 'Cập nhật phân công chấm thi thành công!');
      } else {
        throw new Error(result.message);
      }
    } catch (e: any) {
      toast('error', e.message || 'Lỗi khi cập nhật phân công.');
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setUsers(result.data || []);
    } catch (e: any) {
      setUserError(e.message || 'Lỗi kết nối API Backend.');
      const errorMsg = e.message || '';
      if (errorMsg.includes('Token đã hết hạn') || errorMsg.includes('Token không hợp lệ') || errorMsg.includes('xác thực')) {
        toast('error', 'Phiên đăng nhập đã hết hạn. Đang tự động đăng xuất...');
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/admin/users/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast('success', `Cập nhật vai trò thành công cho ${result.data.username}!`);
    } catch (e: any) {
      toast('error', e.message || 'Không thể cập nhật vai trò.');
      const errorMsg = e.message || '';
      if (errorMsg.includes('Token đã hết hạn') || errorMsg.includes('Token không hợp lệ') || errorMsg.includes('xác thực')) {
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeForm.username || !judgeForm.email || !judgeForm.password) {
      toast('error', 'Vui lòng nhập đầy đủ thông tin (Tên, Email, Mật khẩu).');
      return;
    }

    setSubmittingJudge(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8000/index.php/api/auth/create-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(judgeForm),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      
      toast('success', `Tạo tài khoản Giám khảo "${judgeForm.username}" thành công!`);
      setShowCreateJudgeModal(false);
      setJudgeForm({ username: '', email: '', password: '' });
      fetchUsers(); // Tải lại danh sách
    } catch (e: any) {
      toast('error', e.message || 'Không thể tạo tài khoản Giám khảo.');
    } finally {
      setSubmittingJudge(false);
    }
  };

  // ── Fetch Hackathons ──
  useEffect(() => {
    if (isAdmin) fetchContests();
  }, [isAdmin, activeTab]);

  const fetchContests = async () => {
    setLoadingContests(true);
    setContestError(null);
    try {
      const res = await fetch('http://localhost:8000/index.php/api/hackathons');
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setContests(result.data || []);
    } catch (e: any) {
      setContestError(e.message || 'Lỗi tải danh sách Hackathon.');
    } finally {
      setLoadingContests(false);
    }
  };

  // ── Mở modal ──
  const openCreate = () => {
    setEditingContest(null);
    setFormData({ ...EMPTY_FORM });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (c: Hackathon) => {
    setEditingContest(c);
    setFormData({
      name: c.name,
      category: c.category || 'AI & ML',
      description: c.description || '',
      location: c.location || '',
      startDate: c.startDate ? c.startDate.replace(' ', 'T').slice(0, 16) : '',
      endDate: c.endDate ? c.endDate.replace(' ', 'T').slice(0, 16) : '',
      registrationStart: c.registrationStart ? c.registrationStart.replace(' ', 'T').slice(0, 16) : '',
      registrationEnd: c.registrationEnd ? c.registrationEnd.replace(' ', 'T').slice(0, 16) : '',
      registrationDeadline: (c as any).registration_deadline ? (c as any).registration_deadline.replace(' ', 'T').slice(0, 16) : (c.registrationEnd ? c.registrationEnd.replace(' ', 'T').slice(0, 16) : ''),
      maxTeams: c.maxTeams || 50,
      status: c.status,
      organizer: c.organizer || '',
      schedule: c.schedule || '',
      prizeDetails: (c as any).prize_details || c.prizeDetails || '',
      rules: c.rules || '',
      criteria: c.criteria || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContest(null);
    setFormError(null);
  };

  // ── Submit form (tạo / cập nhật) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.category || !formData.startDate || !formData.endDate || !formData.registrationStart || !formData.registrationEnd) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }
    if (formData.endDate < formData.startDate) {
      setFormError('Ngày kết thúc sự kiện phải sau ngày bắt đầu.');
      return;
    }
    if (formData.registrationEnd < formData.registrationStart) {
      setFormError('Hạn đăng ký phải sau ngày mở đăng ký.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const isEdit = !!editingContest;
      const url = isEdit
        ? `http://localhost:8000/index.php/api/admin/hackathons/${editingContest!.id}`
        : 'http://localhost:8000/index.php/api/admin/hackathons';

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          start_date: formData.startDate.replace('T', ' ') + ':00',
          end_date: formData.endDate.replace('T', ' ') + ':00',
          registration_start: formData.registrationStart.replace('T', ' ') + ':00',
          registration_end: formData.registrationEnd.replace('T', ' ') + ':00',
          max_teams: Number(formData.maxTeams),
          status: formData.status,
          organizer: formData.organizer,
          schedule: formData.schedule,
          prize_details: formData.prizeDetails,
          rules: formData.rules,
          criteria: formData.criteria,
          registration_deadline: (formData.registrationDeadline || formData.registrationEnd).replace('T', ' ') + ':00',
        }),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);

      toast('success', isEdit ? `Đã cập nhật Hackathon "${formData.name}"!` : `Đã tạo Hackathon "${formData.name}"!`);
      closeModal();
      fetchContests();
    } catch (e: any) {
      setFormError(e.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Xoá ──
  const handleDelete = async (contest: Hackathon) => {
    setDeletingId(contest.id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${contest.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setContests(prev => prev.filter(c => c.id !== contest.id));
      toast('success', result.message || 'Đã xoá Hackathon thành công!');
    } catch (e: any) {
      toast('error', e.message || 'Không thể xoá Hackathon.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // ── Teams Management ──
  const handleOpenTeams = async (contest: Hackathon) => {
    setSelectedHackathonForTeams(contest);
    setShowTeamsModal(true);
    setLoadingTeams(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${contest.id}/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setRegisteredTeams(result.data || []);
    } catch (e: any) {
      toast('error', e.message || 'Lỗi tải danh sách đội thi.');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleRemoveTeam = async (teamId: number) => {
    if (!selectedHackathonForTeams) return;
    if (!confirm('Bạn có chắc muốn xoá đội thi này khỏi sự kiện? Hành động này sẽ xoá luôn bài nộp (nếu có) của đội này trong sự kiện.')) return;
    setRemovingTeamId(teamId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTeams.id}/teams/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', result.message || 'Đã xoá đội thi thành công!');
      setRegisteredTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (e: any) {
      toast('error', e.message || 'Không thể xoá đội thi.');
    } finally {
      setRemovingTeamId(null);
    }
  };

  const handleApproveRegistration = async (teamId: number) => {
    if (!selectedHackathonForTeams) return;
    setProcessingRegId(teamId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTeams.id}/teams/${teamId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã duyệt đội thi đăng ký thành công!');
      setRegisteredTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'APPROVED' } : t));
    } catch (e: any) {
      toast('error', e.message || 'Lỗi khi duyệt đội thi.');
    } finally {
      setProcessingRegId(null);
    }
  };

  const handleRejectRegistration = async (teamId: number) => {
    if (!selectedHackathonForTeams) return;
    setProcessingRegId(teamId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTeams.id}/teams/${teamId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã từ chối đơn đăng ký đội thi!');
      setRegisteredTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'REJECTED' } : t));
    } catch (e: any) {
      toast('error', e.message || 'Lỗi khi từ chối đội thi.');
    } finally {
      setProcessingRegId(null);
    }
  };

  // ── Fetch Milestones & Schedules & Challenge side-effects ──
  useEffect(() => {
    if (selectedHackathonForTimeline) {
      fetchMilestones(selectedHackathonForTimeline.id);
      fetchSchedules(selectedHackathonForTimeline.id);
      fetchChallenge(selectedHackathonForTimeline.id);
    }
  }, [selectedHackathonForTimeline]);

  const fetchMilestones = async (hackathonId: number) => {
    setLoadingMilestones(true);
    try {
      const res = await fetch(`http://localhost:8000/index.php/api/hackathons/${hackathonId}/milestones`);
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setMilestones(result.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMilestones(false);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathonForTimeline) return;
    try {
      const token = localStorage.getItem('auth_token');
      const isEdit = !!editingMilestone;
      const url = isEdit 
        ? `http://localhost:8000/index.php/api/milestones/${editingMilestone.id}`
        : `http://localhost:8000/index.php/api/hackathons/${selectedHackathonForTimeline.id}/milestones`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(milestoneForm),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      
      toast('success', isEdit ? 'Đã cập nhật mốc thời gian!' : 'Đã tạo mốc thời gian mới!');
      setMilestoneForm({ name: '', description: '', dueDate: '' });
      setEditingMilestone(null);
      fetchMilestones(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Thao tác thất bại.');
    }
  };

  const handleMilestoneDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá mốc thời gian này?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/milestones/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã xoá mốc thời gian thành công!');
      if (selectedHackathonForTimeline) fetchMilestones(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Không thể xoá mốc thời gian.');
    }
  };

  const fetchSchedules = async (hackathonId: number) => {
    setLoadingSchedules(true);
    try {
      const res = await fetch(`http://localhost:8000/index.php/api/schedules?hackathonId=${hackathonId}`);
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        setSchedules(result.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathonForTimeline) return;
    try {
      const token = localStorage.getItem('auth_token');
      const isEdit = !!editingSchedule;
      const url = isEdit 
        ? `http://localhost:8000/index.php/api/schedules/${editingSchedule.id}`
        : `http://localhost:8000/index.php/api/schedules`;
      
      const body = isEdit 
        ? scheduleForm 
        : { ...scheduleForm, hackathonId: selectedHackathonForTimeline.id };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      
      toast('success', isEdit ? 'Đã cập nhật lịch trình!' : 'Đã tạo sự kiện lịch trình mới!');
      setScheduleForm({ title: '', description: '', startTime: '', endTime: '', location: '' });
      setEditingSchedule(null);
      fetchSchedules(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Thao tác thất bại.');
    }
  };

  // ── Challenge handlers ──────────────────────────────────────────────────

  const fetchChallenge = async (hackathonId: number) => {
    setLoadingChallenge(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${hackathonId}/challenge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.status === 'success') {
        const d = result.data;
        setChallenge(d.exists ? d : null);
        if (d.exists) {
          setChallengeForm({
            title: d.title || '',
            description: d.description || '',
            resources: d.resources || '',
            constraints: d.constraints || '',
            criteriaItems: Array.isArray(d.criteria) && d.criteria.length > 0
              ? d.criteria.map((c: any) => ({ name: c.name || '', weight: c.weight ?? 30 }))
              : [{ name: '', weight: 30 }],
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChallenge(false);
    }
  };

  const handleChallengeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathonForTimeline) return;
    setSavingChallenge(true);
    try {
      const token = localStorage.getItem('auth_token');
      const criteriaJson = JSON.stringify(
        challengeForm.criteriaItems.filter(c => c.name.trim())
      );
      const res = await fetch(
        `http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTimeline.id}/challenge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: challengeForm.title,
            description: challengeForm.description,
            resources: challengeForm.resources,
            constraints: challengeForm.constraints,
            criteria_json: criteriaJson,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', result.message || 'Lưu đề bài thành công!');
      fetchChallenge(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Lưu đề bài thất bại.');
    } finally {
      setSavingChallenge(false);
    }
  };

  const handleChallengeRelease = async () => {
    if (!selectedHackathonForTimeline) return;
    if (!confirm('Bạn có chắc muốn phát đề bài ngay lập tức cho tất cả các đội? Hành động này không thể hoàn tác!')) return;
    setReleasingChallenge(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTimeline.id}/challenge/release`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', result.message || 'Đề bài đã được phát!');
      fetchChallenge(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Không thể phát đề bài.');
    } finally {
      setReleasingChallenge(false);
    }
  };

  const [uploadingFile, setUploadingFile] = useState(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHackathonForTimeline) return;

    if (file.size > 20 * 1024 * 1024) {
      toast('error', 'Kích thước file vượt quá 20MB.');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${selectedHackathonForTimeline.id}/challenge/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Tải lên file đề bài thành công!');
      fetchChallenge(selectedHackathonForTimeline.id); // Reload
    } catch (error: any) {
      toast('error', error.message || 'Lỗi khi tải file lên.');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleStartContest = async (id: number) => {
    if (!confirm('Bạn có chắc muốn BẮT ĐẦU cuộc thi? Đề bài sẽ được tự động phát và thông báo sẽ gửi tới tất cả các đội!')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/hackathons/${id}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã bắt đầu cuộc thi và phát thông báo!');
      fetchContests(); // Reload hackathon list to update status
    } catch (error: any) {
      toast('error', error.message || 'Lỗi khi bắt đầu cuộc thi.');
    }
  };

  const handleScheduleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xoá lịch trình này?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      toast('success', 'Đã xoá lịch trình thành công!');
      if (selectedHackathonForTimeline) fetchSchedules(selectedHackathonForTimeline.id);
    } catch (e: any) {
      toast('error', e.message || 'Không thể xoá lịch trình.');
    }
  };
  
  // ── Không có quyền ──
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="text-red-500 font-bold text-6xl mb-4">403</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang quản trị này. Trang này chỉ dành cho Ban tổ chức (ADMIN).
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow"
          >
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  // ── Static data overview ──
  const stats = [
    { label: 'Tổng Hackathon',       value: String(contests.length || '—'), icon: Calendar,  color: 'blue' },
    { label: 'Đội thi đăng ký',      value: '856',                           icon: Users,     color: 'green' },
    { label: 'Đang diễn ra',         value: String(contests.filter(c => c.status === 'ACTIVE').length || '—'), icon: Trophy, color: 'purple' },
    { label: 'Người dùng hệ thống',  value: String(users.length || '—'),     icon: BarChart3, color: 'orange' },
  ];

  const filteredUsers    = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredContests = contests.filter(c =>
    c.name?.toLowerCase().includes(contestSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(contestSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* ── Toast ── */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border bg-white max-w-sm transition-all animate-bounce`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="text-green-500 flex-shrink-0" size={22} />
            : <AlertCircle  className="text-red-500 flex-shrink-0"   size={22} />}
          <span className="text-sm font-medium text-gray-700">{notification.message}</span>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Xác nhận xoá cuộc thi</h3>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Bạn có chắc muốn xoá cuộc thi <span className="font-semibold text-gray-900">"{confirmDelete.name}"</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {deletingId === confirmDelete.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                Xoá vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Judge Modal ── */}
      {showCreateJudgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-purple-600" />
                Tạo tài khoản Giám khảo
              </h3>
              <button onClick={() => setShowCreateJudgeModal(false)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateJudge} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên giám khảo <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={judgeForm.username}
                  onChange={e => setJudgeForm({...judgeForm, username: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="VD: Nguyen Van A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={judgeForm.email}
                  onChange={e => setJudgeForm({...judgeForm, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  required
                  value={judgeForm.password}
                  onChange={e => setJudgeForm({...judgeForm, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateJudgeModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingJudge}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 shadow-md disabled:opacity-60"
                >
                  {submittingJudge ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Xác nhận tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Teams Modal ── */}
      {showTeamsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                Đội thi tham gia: {selectedHackathonForTeams?.name}
              </h3>
              <button onClick={() => setShowTeamsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                  <span className="text-sm text-gray-500">Đang tải danh sách đội thi...</span>
                </div>
              ) : registeredTeams.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Chưa có đội thi nào đăng ký sự kiện này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tên Đội</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đội Trưởng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mô tả</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Đăng ký lúc</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-48">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {registeredTeams.map(team => (
                        <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{team.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div>{team.leader_name}</div>
                            <div className="text-xs text-gray-400">{team.leader_email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate" title={team.description}>
                            {team.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              team.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                              team.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {team.status === 'APPROVED' ? 'Đã duyệt' :
                               team.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(team.registered_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {(team.status === 'PENDING' || !team.status) && (
                                <>
                                  <button
                                    onClick={() => handleApproveRegistration(team.id)}
                                    disabled={processingRegId === team.id}
                                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    title="Duyệt tham gia"
                                  >
                                    {processingRegId === team.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleRejectRegistration(team.id)}
                                    disabled={processingRegId === team.id}
                                    className="px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    title="Từ chối tham gia"
                                  >
                                    {processingRegId === team.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {team.status === 'APPROVED' && (
                                <button
                                  onClick={() => handleRejectRegistration(team.id)}
                                  disabled={processingRegId === team.id}
                                  className="px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  title="Từ chối tham gia"
                                >
                                  {processingRegId === team.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Từ chối
                                </button>
                              )}
                              {team.status === 'REJECTED' && (
                                <button
                                  onClick={() => handleApproveRegistration(team.id)}
                                  disabled={processingRegId === team.id}
                                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  title="Duyệt tham gia"
                                >
                                  {processingRegId === team.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Duyệt
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveTeam(team.id)}
                                disabled={removingTeamId === team.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50"
                                title="Xoá đội khỏi sự kiện"
                              >
                                {removingTeamId === team.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {editingContest ? <Pencil size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />}
                {editingContest ? 'Chỉnh sửa Hackathon' : 'Tạo Hackathon mới'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              {/* Tên Hackathon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên Hackathon <span className="text-red-500">*</span>
                </label>
                <input
                  id="contest-name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="VD: AI Innovation Hackathon 2026"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  required
                />
              </div>

              {/* Danh mục + Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="contest-category"
                    value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trạng thái</label>
                  <select
                    id="contest-status"
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="UPCOMING">Sắp diễn ra</option>
                    <option value="ACTIVE">Đang diễn ra</option>
                    <option value="COMPLETED">Đã kết thúc</option>
                    <option value="CANCELLED">Đã huỷ</option>
                  </select>
                </div>
              </div>

              {/* Thời gian Đăng ký */}
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Thời gian đăng ký của thí sinh</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mở đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-reg-start"
                    type="datetime-local"
                    value={formData.registrationStart}
                    onChange={e => setFormData(p => ({ ...p, registrationStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Hạn chót đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-reg-end"
                    type="datetime-local"
                    value={formData.registrationEnd}
                    onChange={e => setFormData(p => ({ ...p, registrationEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                    required
                  />
                </div>
              </div>

              {/* Thời gian Diễn ra sự kiện */}
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="col-span-2">
                  <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Thời gian diễn ra sự kiện</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-start-date"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-end-date"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                    required
                  />
                </div>
              </div>

              {/* Địa điểm + Số đội tối đa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa điểm</label>
                  <input
                    id="contest-location"
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số đội tối đa</label>
                  <input
                    id="contest-max-teams"
                    type="number"
                    min={1}
                    value={formData.maxTeams}
                    onChange={e => setFormData(p => ({ ...p, maxTeams: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Ban tổ chức */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ban tổ chức</label>
                <input
                  id="contest-organizer"
                  type="text"
                  value={formData.organizer}
                  onChange={e => setFormData(p => ({ ...p, organizer: e.target.value }))}
                  placeholder="VD: Bộ Khoa học và Công nghệ"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết</label>
                <textarea
                  id="contest-description"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Nhập mô tả chi tiết về Hackathon..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white"
                />
              </div>

              {/* Các trường cấu hình nâng cao */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu chí đánh giá</label>
                <textarea
                  id="contest-criteria"
                  rows={3}
                  value={formData.criteria}
                  onChange={e => setFormData(p => ({ ...p, criteria: e.target.value }))}
                  placeholder="Ví dụ: Tính sáng tạo (30%), Khả năng ứng dụng (25%)..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lịch trình</label>
                <textarea
                  id="contest-schedule"
                  rows={3}
                  value={formData.schedule}
                  onChange={e => setFormData(p => ({ ...p, schedule: e.target.value }))}
                  placeholder="Ví dụ: 08:00 Khai mạc, 09:00 Bắt đầu..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cơ cấu giải thưởng</label>
                <textarea
                  id="contest-prize"
                  rows={3}
                  value={formData.prizeDetails}
                  onChange={e => setFormData(p => ({ ...p, prizeDetails: e.target.value }))}
                  placeholder="Ví dụ: Giải nhất: 70,000,000đ..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thể lệ chung</label>
                <textarea
                  id="contest-rules"
                  rows={3}
                  value={formData.rules}
                  onChange={e => setFormData(p => ({ ...p, rules: e.target.value }))}
                  placeholder="Ví dụ: Mỗi đội 3-5 người, bắt buộc AI/ML..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none bg-white"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingContest ? <Pencil size={16} /> : <Plus size={16} />)}
                {editingContest ? 'Lưu thay đổi' : 'Tạo Hackathon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ HEADER ══════════════════ */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý hệ thống</h1>
              <p className="text-gray-500 mt-1">Tổng quan thông tin và kiểm soát vai trò các thành viên trong Hackathon</p>
            </div>
            {activeTab === 'events' && (
              <button
                id="btn-create-contest"
                onClick={openCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-sm cursor-pointer"
              >
                <Plus size={18} />
                Tạo Hackathon mới
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {['overview', 'events', 'permissions', 'settings', 'logs'].map(tab => (
              <button
                key={tab}
                id={`admin-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm cursor-pointer ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab === 'overview'     && 'Tổng quan'}
                {tab === 'events'       && 'Quản lý Hackathon'}
                {tab === 'permissions'  && 'Phân quyền'}
                {tab === 'settings'     && 'Cài đặt'}
                {tab === 'logs'         && 'Nhật ký hoạt động'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ══════════════════ CONTENT ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Tab: Tổng quan ── */}
        {activeTab === 'overview' && (() => {
          const categoryData = CATEGORIES.map(cat => ({
            name: cat,
            count: contests.filter(c => c.category === cat).length
          })).filter(item => item.count > 0 || item.name === 'AI & ML' || item.name === 'Healthcare' || item.name === 'Education');

          const statusData = [
            { name: 'Sắp diễn ra', value: contests.filter(c => c.status === 'UPCOMING').length, color: '#3B82F6' },
            { name: 'Đang diễn ra', value: contests.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
            { name: 'Đã kết thúc', value: contests.filter(c => c.status === 'COMPLETED').length, color: '#6B7280' },
            { name: 'Đã huỷ', value: contests.filter(c => c.status === 'CANCELLED').length, color: '#EF4444' }
          ].filter(item => item.value > 0);

          return (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:-translate-y-0.5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                          <Icon size={24} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{stat.value}</div>
                      <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* ── Thống kê trực quan (Charts Section) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Cột 1 & 2: Biểu đồ cột phân loại */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2 text-left">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Phân bố Hackathon theo Danh mục</h3>
                  <div className="h-64">
                    {contests.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        Chưa có dữ liệu thống kê
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                          <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} allowDecimals={false} />
                          <ChartTooltip 
                            contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                            labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3B82F6" barSize={32}>
                            {categoryData.map((entry, index) => {
                              const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Cột 3: Biểu đồ tròn trạng thái */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Tỷ lệ trạng thái sự kiện</h3>
                  <div className="h-64 flex flex-col justify-between">
                    {contests.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        Chưa có dữ liệu thống kê
                      </div>
                    ) : statusData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        Không có trạng thái hợp lệ
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip
                                contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2 border-t border-gray-100 pt-3">
                          {statusData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                              <span>{item.name}: {item.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách cuộc thi gần đây */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Hackathon gần đây</h2>
                <button onClick={() => setActiveTab('events')} className="text-sm text-blue-600 font-semibold hover:underline cursor-pointer">
                  Xem tất cả →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Hackathon</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contests.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm text-left">{c.name}</td>
                        <td className="px-6 py-4 text-left">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[c.status] ?? c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-left">{c.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-left">{c.startDate?.slice(0,10)} → {c.endDate?.slice(0,10)}</td>
                      </tr>
                    ))}
                    {contests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                          Chưa có Hackathon nào. Hãy tạo Hackathon đầu tiên!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

        {/* ── Tab: Quản lý Hackathon (CRUD) ── */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Thanh tìm kiếm */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="contest-search"
                  type="text"
                  placeholder="Tìm theo tên hoặc danh mục..."
                  value={contestSearch}
                  onChange={e => setContestSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
              <span className="text-sm text-gray-500 font-semibold">
                {filteredContests.length} / {contests.length} Hackathon
              </span>
            </div>

            {/* Error */}
            {contestError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Lỗi tải dữ liệu</h4>
                  <p className="text-xs text-red-700 mt-1">{contestError}</p>
                  <button onClick={fetchContests} className="mt-2 text-xs font-semibold text-red-800 underline hover:text-red-900">
                    Thử tải lại
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loadingContests ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-gray-200">
                <Loader2 className="text-blue-600 animate-spin" size={38} />
                <span className="text-sm text-gray-500 font-medium">Đang tải danh sách Hackathon...</span>
              </div>
            ) : (
              <>
                {/* Grid cards */}
                {filteredContests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredContests.map(c => (
                      <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col overflow-hidden">
                        {/* Card Header */}
                        <div className="p-5 pb-3 flex-1">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 text-left">{c.name}</h3>
                            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[c.status] ?? c.status}
                            </span>
                          </div>

                          {c.description && (
                            <p className="text-gray-500 text-xs line-clamp-2 mb-3 text-left">{c.description}</p>
                          )}

                          <div className="space-y-1.5 text-left">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Tag size={13} className="text-blue-400" />
                              <span>{c.category}</span>
                            </div>
                            {c.location && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin size={13} className="text-rose-400" />
                                <span>{c.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar size={13} className="text-purple-400" />
                              <span>Diễn ra: {c.startDate?.slice(0,10)} → {c.endDate?.slice(0,10)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock size={13} className="text-amber-500" />
                              <span>Đăng ký: {c.registrationStart?.slice(0,10)} → {c.registrationEnd?.slice(0,10)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Hash size={13} className="text-green-400" />
                              <span>Tối đa {c.maxTeams} đội</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: actions */}
                        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                          <span className="text-xs text-gray-400">#{c.id}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenTeams(c)}
                              className="p-1.5 hover:bg-white hover:shadow rounded-lg transition-all text-gray-400 hover:text-indigo-600 cursor-pointer"
                              title="Quản lý Đội thi"
                            >
                              <Users size={16} />
                            </button>
                            <button
                              onClick={() => setSelectedHackathonForTimeline(c)}
                              className="p-1.5 hover:bg-white hover:shadow rounded-lg transition-all text-gray-400 hover:text-blue-600 cursor-pointer"
                              title="Quản lý Timeline & Lịch trình"
                            >
                              <Clock size={16} />
                            </button>
                            <button
                              id={`btn-edit-contest-${c.id}`}
                              onClick={() => openEdit(c)}
                              className="p-1.5 hover:bg-blue-50 hover:shadow rounded-lg transition-all text-gray-400 hover:text-blue-600 cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              id={`btn-start-contest-${c.id}`}
                              onClick={() => handleStartContest(c.id)}
                              disabled={c.status === 'COMPLETED' || c.status === 'CANCELLED'}
                              className="p-1.5 hover:bg-green-50 hover:shadow rounded-lg transition-all text-gray-400 hover:text-green-600 cursor-pointer disabled:opacity-40"
                              title="Bắt đầu cuộc thi"
                            >
                              <PlayCircle size={16} />
                            </button>
                            <button
                              id={`btn-delete-contest-${c.id}`}
                              onClick={() => setConfirmDelete(c)}
                              disabled={deletingId === c.id}
                              className="p-1.5 hover:bg-red-50 hover:shadow rounded-lg transition-all text-gray-400 hover:text-red-500 disabled:opacity-40 cursor-pointer"
                              title="Xoá Hackathon"
                            >
                              {deletingId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Không có Hackathon nào phù hợp</p>
                    <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khoá tìm kiếm hoặc tạo Hackathon mới</p>
                    <button
                      onClick={openCreate}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Plus size={16} /> Tạo Hackathon đầu tiên
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Tab: Phân quyền ── */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="text-blue-600" size={22} />
                    Danh sách &amp; Phân quyền thành viên
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Thay đổi vai trò thành viên để cấp quyền quản lý (BTC), chấm thi (Giám khảo) hoặc tham gia (Thí sinh).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="user-search"
                      type="text"
                      placeholder="Tìm theo tên hoặc email..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowCreateJudgeModal(true)}
                    className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus size={16} /> Tạo Giám khảo
                  </button>
                </div>
              </div>

              {userError && (
                <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Lỗi tải dữ liệu</h4>
                    <p className="text-xs text-red-700 mt-1">{userError}</p>
                    <button onClick={fetchUsers} className="mt-2 text-xs font-semibold text-red-800 underline">Thử tải lại</button>
                  </div>
                </div>
              )}

              {loadingUsers ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="text-blue-600 animate-spin" size={38} />
                  <span className="text-sm text-gray-500 font-medium">Đang tải danh sách thành viên...</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thành viên</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò hiện tại</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-56">Phân quyền vai trò</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Phân công</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">#{user.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                  {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">{user.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-6 py-4">
                              {user.role?.toUpperCase() === 'ADMIN' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  <Shield size={12} /> BTC (ADMIN)
                                </span>
                              )}
                              {user.role?.toUpperCase() === 'JUDGE' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                  Giám khảo (JUDGE)
                                </span>
                              )}
                              {user.role?.toUpperCase() === 'PARTICIPANT' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                  Thí sinh (PARTICIPANT)
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {updatingUserId === user.id ? (
                                <div className="flex items-center justify-center gap-1.5 py-1 text-sm text-blue-600 font-semibold">
                                  <Loader2 className="animate-spin" size={16} />
                                  <span>Đang lưu...</span>
                                </div>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={e => handleRoleChange(user.id, e.target.value)}
                                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                                >
                                  <option value="PARTICIPANT">Thí sinh (PARTICIPANT)</option>
                                  <option value="JUDGE">Giám khảo (JUDGE)</option>
                                  <option value="ADMIN">Ban tổ chức (ADMIN)</option>
                                </select>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {user.role?.toUpperCase() === 'JUDGE' ? (
                                <button
                                  onClick={() => {
                                    setSelectedJudgeForAssignments(user);
                                    setShowAssignmentsModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-colors text-xs font-semibold rounded shadow-sm inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Award size={13} />
                                  Chấm đội thi
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs italic">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                            Không tìm thấy thành viên nào phù hợp với từ khoá tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Cài đặt ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                <SettingsIcon className="text-blue-600" size={22} />
                Quản lý Tiêu chí chấm điểm toàn cục
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Thiết lập các tiêu chí chấm điểm (như Tính sáng tạo, Kỹ thuật...) để Giám khảo sử dụng khi đánh giá các đội thi.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form thêm tiêu chí */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 self-start">
                  <h3 className="font-bold text-gray-900 text-sm mb-4 text-left">Thêm tiêu chí mới</h3>
                  <form onSubmit={handleCreateCriteria} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Tên tiêu chí *</label>
                      <input
                        type="text"
                        required
                        value={criteriaForm.name}
                        onChange={e => setCriteriaForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="VD: Tính thực tiễn, Sáng tạo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Trọng số (%) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={criteriaForm.weight}
                          onChange={e => setCriteriaForm(p => ({ ...p, weight: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Điểm tối đa *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={criteriaForm.maxScore}
                          onChange={e => setCriteriaForm(p => ({ ...p, maxScore: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingCriteria}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {submittingCriteria ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Thêm tiêu chí
                    </button>
                  </form>
                </div>

                {/* Danh sách tiêu chí */}
                <div className="lg:col-span-2 space-y-4">
                  {loadingCriteria ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-500 text-sm">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <span>Đang tải danh sách tiêu chí...</span>
                    </div>
                  ) : criteriaList.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                      <SettingsIcon size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm font-medium">Chưa có tiêu chí nào được thiết lập.</p>
                      <p className="text-gray-400 text-xs mt-1">Giám khảo sẽ không thể chấm điểm nếu không có tiêu chí.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tên tiêu chí</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Trọng số</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Điểm tối đa</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-20">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {criteriaList.map(crit => (
                            <tr key={crit.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 text-left">{crit.name}</td>
                              <td className="px-4 py-3.5 text-sm font-medium text-gray-600 text-center">
                                {Math.round(parseFloat(crit.weight) * 100)}%
                              </td>
                              <td className="px-4 py-3.5 text-sm font-medium text-gray-600 text-center">{crit.max_score}</td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => handleDeleteCriteria(crit.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Xoá tiêu chí"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-600">Tổng trọng số:</span>
                        {(() => {
                          const totalW = criteriaList.reduce((sum, item) => sum + Math.round(parseFloat(item.weight) * 100), 0);
                          return (
                            <span className={totalW === 100 ? 'text-green-600' : 'text-red-500'}>
                              {totalW}% {totalW === 100 ? '✓' : '(Yêu cầu phải bằng 100%)'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Nhật ký hoạt động ── */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <FileText className="text-blue-600" size={22} />
                    Nhật ký hoạt động của Admin
                  </h2>
                  <p className="text-sm text-gray-500">
                    Theo dõi lịch sử các thao tác thay đổi dữ liệu, đăng nhập và đăng xuất của Ban tổ chức.
                  </p>
                </div>
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
                >
                  {loadingLogs ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                  Làm mới
                </button>
              </div>

              {/* Bộ lọc & Tìm kiếm */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </span>
                  <input
                    type="text"
                    value={logsSearchTerm}
                    onChange={e => setLogsSearchTerm(e.target.value)}
                    placeholder="Tìm theo mô tả, tên admin..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <select
                    value={logsActionFilter}
                    onChange={e => setLogsActionFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  >
                    <option value="">Tất cả hành động</option>
                    <option value="LOGIN">Đăng nhập (LOGIN)</option>
                    <option value="LOGOUT">Đăng xuất (LOGOUT)</option>
                    <option value="CREATE">Tạo mới (CREATE)</option>
                    <option value="UPDATE">Cập nhật (UPDATE)</option>
                    <option value="DELETE">Xóa (DELETE)</option>
                    <option value="APPROVE_TEAM">Duyệt đội thi</option>
                    <option value="REJECT_TEAM">Từ chối đội thi</option>
                    <option value="REMOVE_TEAM">Xóa đội thi khỏi cuộc thi</option>
                    <option value="RELEASE_CHALLENGE">Phát đề thi</option>
                    <option value="UPLOAD_FILE">Tải lên file</option>
                    <option value="ASSIGN_JUDGE">Phân công giám khảo</option>
                  </select>
                </div>
                <div>
                  <select
                    value={logsTypeFilter}
                    onChange={e => setLogsTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  >
                    <option value="">Tất cả đối tượng tác động</option>
                    <option value="users">Người dùng / Giám khảo</option>
                    <option value="contests">Cuộc thi (Contest)</option>
                    <option value="teams">Đội thi (Team)</option>
                    <option value="contest_problems">Đề thi (Challenge)</option>
                    <option value="milestones">Mốc thời gian (Milestone)</option>
                    <option value="schedules">Lịch trình (Schedule)</option>
                    <option value="criteria">Tiêu chí chấm điểm</option>
                    <option value="judging_assignments">Phân công chấm thi</option>
                  </select>
                </div>
              </div>

              {/* Danh sách log */}
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <span className="text-sm text-gray-500">Đang tải nhật ký hoạt động...</span>
                </div>
              ) : (() => {
                const filteredLogs = logs.filter(log => {
                  const matchesSearch = 
                    (log.description || '').toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                    (log.adminName || '').toLowerCase().includes(logsSearchTerm.toLowerCase()) ||
                    (log.adminEmail || '').toLowerCase().includes(logsSearchTerm.toLowerCase());
                  const matchesAction = !logsActionFilter || log.action === logsActionFilter;
                  const matchesType = !logsTypeFilter || log.targetType === logsTypeFilter;
                  return matchesSearch && matchesAction && matchesType;
                });

                if (filteredLogs.length === 0) {
                  return (
                    <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
                      <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Không tìm thấy hoạt động nào phù hợp.</p>
                    </div>
                  );
                }

                return (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người thực hiện</th>
                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mô tả chi tiết</th>
                            <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Địa chỉ IP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150">
                          {filteredLogs.map(log => {
                            let actionColor = 'bg-gray-100 text-gray-800 border-gray-200';
                            let actionLabel = log.action;
                            
                            switch (log.action) {
                              case 'LOGIN':
                                actionColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                actionLabel = 'Đăng nhập';
                                break;
                              case 'LOGOUT':
                                actionColor = 'bg-gray-50 text-gray-600 border-gray-200';
                                actionLabel = 'Đăng xuất';
                                break;
                              case 'CREATE':
                                actionColor = 'bg-blue-50 text-blue-700 border-blue-200';
                                actionLabel = 'Tạo mới';
                                break;
                              case 'UPDATE':
                                actionColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                                actionLabel = 'Cập nhật';
                                break;
                              case 'DELETE':
                                actionColor = 'bg-red-50 text-red-700 border-red-200';
                                actionLabel = 'Xóa vĩnh viễn';
                                break;
                              case 'APPROVE_TEAM':
                                actionColor = 'bg-green-50 text-green-700 border-green-200';
                                actionLabel = 'Duyệt đội thi';
                                break;
                              case 'REJECT_TEAM':
                                actionColor = 'bg-amber-50 text-amber-700 border-amber-200';
                                actionLabel = 'Từ chối đội';
                                break;
                              case 'REMOVE_TEAM':
                                actionColor = 'bg-rose-50 text-rose-700 border-rose-200';
                                actionLabel = 'Loại đội thi';
                                break;
                              case 'RELEASE_CHALLENGE':
                                actionColor = 'bg-orange-50 text-orange-700 border-orange-200';
                                actionLabel = 'Phát đề thi';
                                break;
                              case 'UPLOAD_FILE':
                                actionColor = 'bg-cyan-50 text-cyan-700 border-cyan-200';
                                actionLabel = 'Tải lên file';
                                break;
                              case 'ASSIGN_JUDGE':
                                actionColor = 'bg-purple-50 text-purple-700 border-purple-200';
                                actionLabel = 'Giao chấm thi';
                                break;
                            }

                            return (
                              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-left font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-left">
                                  <div className="font-semibold text-gray-900">{log.adminName}</div>
                                  <div className="text-xs text-gray-400">{log.adminEmail}</div>
                                </td>
                                <td className="px-6 py-4 text-left whitespace-nowrap">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${actionColor}`}>
                                    {actionLabel}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-700 font-medium text-left max-w-md break-words">
                                  {log.description}
                                </td>
                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-left font-mono text-xs">
                                  {log.ipAddress || '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}


        {/* ── Timeline & Schedule Modal ── */}
        {selectedHackathonForTimeline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Quản lý Timeline &amp; Lịch trình
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Hackathon: <span className="font-semibold text-gray-800">{selectedHackathonForTimeline.name}</span></p>
                </div>
                <button onClick={() => setSelectedHackathonForTimeline(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex px-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setActiveTimelineTab('milestones')}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
                    activeTimelineTab === 'milestones'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mốc thời gian (Timeline)
                </button>
                <button
                  onClick={() => setActiveTimelineTab('schedules')}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
                    activeTimelineTab === 'schedules'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Lịch trình sự kiện
                </button>
                <button
                  onClick={() => setActiveTimelineTab('challenge')}
                  className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTimelineTab === 'challenge'
                      ? 'border-orange-500 text-orange-600 font-bold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen size={14} />
                  Đề bài & Tiêu chí
                  {challenge?.released_at && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">ĐÃ PHÁT</span>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">

                {/* ══ TAB: ĐỀ BÀI & TIÊU CHÍ ══ */}
                {activeTimelineTab === 'challenge' && (
                  <div className="w-full">
                    {loadingChallenge ? (
                      <div className="flex items-center justify-center py-16 gap-2 text-gray-500 text-sm">
                        <Loader2 className="animate-spin text-orange-500" size={20} />
                        <span>Đang tải đề bài...</span>
                      </div>
                    ) : (
                      <form onSubmit={handleChallengeSave} className="space-y-5">

                        {/* Status Banner */}
                        {challenge?.released_at ? (
                          <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-xl">
                            <Unlock size={18} className="text-green-600 flex-shrink-0" />
                            <div className="text-left">
                              <p className="text-sm font-bold text-green-800">Đề bài đã được phát công khai</p>
                              <p className="text-xs text-green-600 mt-0.5">
                                Phát lúc: {new Date(challenge.released_at).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <Lock size={18} className="text-amber-600 flex-shrink-0" />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-bold text-amber-800">Đề bài chưa được phát</p>
                              <p className="text-xs text-amber-600 mt-0.5">
                                Sẽ tự động hiển thị khi đến ngày bắt đầu cuộc thi, hoặc bạn có thể phát ngay.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleChallengeRelease}
                              disabled={!challenge || releasingChallenge}
                              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              {releasingChallenge ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                              Phát đề ngay
                            </button>
                          </div>
                        )}

                        {/* Grid: Left form + Right criteria */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Left: Basic Info */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Tiêu đề đề bài *</label>
                              <input
                                type="text"
                                required
                                value={challengeForm.title}
                                onChange={e => setChallengeForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="VD: Xây dựng hệ thống AI quản lý học tập..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Nội dung / Mô tả chi tiết *</label>
                              <textarea
                                rows={6}
                                required
                                value={challengeForm.description}
                                onChange={e => setChallengeForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Mô tả bài toán, context, mục tiêu cần đạt được..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:ring-2 focus:ring-orange-400 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">
                                <FileText size={12} className="inline mr-1" />
                                Tài nguyên / API mẫu / Links
                              </label>
                              <textarea
                                rows={3}
                                value={challengeForm.resources}
                                onChange={e => setChallengeForm(p => ({ ...p, resources: e.target.value }))}
                                placeholder="VD: Dataset: https://... | API docs: https://..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:ring-2 focus:ring-orange-400 focus:outline-none"
                              />
                            </div>
                            
                            {/* FILE UPLOAD */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">File đính kèm đề bài (PDF, ZIP, DOCX)</label>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium">
                                  {uploadingFile ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                                  Tải lên file
                                  <input type="file" className="hidden" accept=".pdf,.zip,.docx" onChange={handleFileUpload} disabled={uploadingFile} />
                                </label>
                                {challenge?.fileUrl ? (
                                  <a href={`http://localhost:8000${challenge.fileUrl}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex-1 truncate text-left">
                                    {challenge.fileName || 'Đã đính kèm file'}
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-500 italic">Chưa có file đính kèm</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-left">Ràng buộc kỹ thuật</label>
                              <textarea
                                rows={3}
                                value={challengeForm.constraints}
                                onChange={e => setChallengeForm(p => ({ ...p, constraints: e.target.value }))}
                                placeholder="VD: Sử dụng Python/JS, không dùng API trả phí..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white resize-none focus:ring-2 focus:ring-orange-400 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Right: Criteria */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-bold text-gray-700 text-left">Tiêu chí chấm điểm</label>
                              <button
                                type="button"
                                onClick={() => setChallengeForm(p => ({
                                  ...p,
                                  criteriaItems: [...p.criteriaItems, { name: '', weight: 20 }]
                                }))}
                                className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                              >+ Thêm tiêu chí</button>
                            </div>
                            <div className="space-y-3">
                              {challengeForm.criteriaItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={e => {
                                        const updated = [...challengeForm.criteriaItems];
                                        updated[idx] = { ...updated[idx], name: e.target.value };
                                        setChallengeForm(p => ({ ...p, criteriaItems: updated }));
                                      }}
                                      placeholder="Tên tiêu chí (VD: Sáng tạo)"
                                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-orange-400 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <input
                                      type="number"
                                      min={0} max={100}
                                      value={item.weight}
                                      onChange={e => {
                                        const updated = [...challengeForm.criteriaItems];
                                        updated[idx] = { ...updated[idx], weight: Number(e.target.value) };
                                        setChallengeForm(p => ({ ...p, criteriaItems: updated }));
                                      }}
                                      className="w-14 px-2 py-1.5 border border-gray-300 rounded text-xs text-center bg-white focus:ring-1 focus:ring-orange-400 focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-500">%</span>
                                    {challengeForm.criteriaItems.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => setChallengeForm(p => ({
                                          ...p,
                                          criteriaItems: p.criteriaItems.filter((_, i) => i !== idx)
                                        }))}
                                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                                      ><X size={13} /></button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {/* Tổng trọng số */}
                              <div className={`text-xs font-bold text-right pr-1 ${
                                challengeForm.criteriaItems.reduce((s, c) => s + c.weight, 0) === 100
                                  ? 'text-green-600' : 'text-red-500'
                              }`}>
                                Tổng: {challengeForm.criteriaItems.reduce((s, c) => s + c.weight, 0)}% 
                                {challengeForm.criteriaItems.reduce((s, c) => s + c.weight, 0) === 100 ? '✓' : '(cần = 100%)'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <button
                            type="submit"
                            disabled={savingChallenge}
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold text-sm rounded-lg transition-colors shadow cursor-pointer"
                          >
                            {savingChallenge ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                            {challenge ? 'Cập nhật đề bài' : 'Lưu đề bài'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* ══ TAB: MILESTONES & SCHEDULES ══ */}
                {activeTimelineTab !== 'challenge' && (
                  <>
                {/* Left Column: Form */}
                <div className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-xl border border-gray-200 flex-shrink-0 self-start">
                  <h4 className="font-bold text-gray-900 text-sm mb-4">
                    {activeTimelineTab === 'milestones' 
                      ? (editingMilestone ? 'Cập nhật mốc thời gian' : 'Thêm mốc thời gian mới') 
                      : (editingSchedule ? 'Cập nhật sự kiện' : 'Thêm sự kiện lịch trình')
                    }
                  </h4>

                  {activeTimelineTab === 'milestones' ? (
                    <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Tên mốc thời gian *</label>
                        <input
                          type="text"
                          required
                          value={milestoneForm.name}
                          onChange={e => setMilestoneForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="VD: Khai mạc, Hạn nộp bài..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Mô tả chi tiết</label>
                        <textarea
                          rows={3}
                          value={milestoneForm.description}
                          onChange={e => setMilestoneForm(p => ({ ...p, description: e.target.value }))}
                          placeholder="Mô tả nội dung mốc thời gian..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none animate-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Hạn chót *</label>
                        <input
                          type="datetime-local"
                          required
                          value={milestoneForm.dueDate}
                          onChange={e => setMilestoneForm(p => ({ ...p, dueDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow transition-colors cursor-pointer"
                        >
                          {editingMilestone ? 'Lưu' : 'Thêm mới'}
                        </button>
                        {editingMilestone && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMilestone(null);
                              setMilestoneForm({ name: '', description: '', dueDate: '' });
                            }}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            Huỷ
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleScheduleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Tiêu đề sự kiện *</label>
                        <input
                          type="text"
                          required
                          value={scheduleForm.title}
                          onChange={e => setScheduleForm(p => ({ ...p, title: e.target.value }))}
                          placeholder="VD: Teambuilding, Checkpoint 1..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Mô tả sự kiện</label>
                        <textarea
                          rows={2}
                          value={scheduleForm.description}
                          onChange={e => setScheduleForm(p => ({ ...p, description: e.target.value }))}
                          placeholder="Nội dung sự kiện..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none animate-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Địa điểm</label>
                        <input
                          type="text"
                          value={scheduleForm.location}
                          onChange={e => setScheduleForm(p => ({ ...p, location: e.target.value }))}
                          placeholder="VD: Hội trường A, Discord..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Thời gian bắt đầu *</label>
                        <input
                          type="datetime-local"
                          required
                          value={scheduleForm.startTime}
                          onChange={e => setScheduleForm(p => ({ ...p, startTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Thời gian kết thúc</label>
                        <input
                          type="datetime-local"
                          value={scheduleForm.endTime}
                          onChange={e => setScheduleForm(p => ({ ...p, endTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow transition-colors cursor-pointer"
                        >
                          {editingSchedule ? 'Lưu' : 'Thêm mới'}
                        </button>
                        {editingSchedule && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSchedule(null);
                              setScheduleForm({ title: '', description: '', startTime: '', endTime: '', location: '' });
                            }}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                          >
                            Huỷ
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>

                {/* Right Column: List */}
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 overflow-y-auto max-h-[55vh]">
                  {activeTimelineTab === 'milestones' ? (
                    loadingMilestones ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-sm">
                        <Loader2 className="animate-spin text-blue-600" size={18} />
                        <span>Đang tải mốc thời gian...</span>
                      </div>
                    ) : milestones.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 text-sm">
                        Chưa có mốc thời gian nào được tạo.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {milestones.map((m, idx) => (
                          <div key={m.id} className="flex gap-3 items-start p-3.5 bg-gray-50 rounded-xl border border-gray-150 relative group">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0 pr-16 text-left">
                              <h5 className="font-bold text-gray-900 text-sm">{m.name}</h5>
                              {m.description && <p className="text-gray-500 text-xs mt-1">{m.description}</p>}
                              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-2">
                                <Calendar size={12} />
                                <span>Hạn chót: {m.dueDate ? new Date(m.dueDate).toLocaleString('vi-VN') : 'Chưa thiết lập'}</span>
                              </div>
                            </div>
                            <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingMilestone(m);
                                  setMilestoneForm({
                                    name: m.name,
                                    description: m.description || '',
                                    dueDate: m.dueDate ? m.dueDate.slice(0, 16) : '',
                                  });
                                }}
                                className="p-1 bg-white hover:bg-blue-50 border border-gray-200 text-gray-500 hover:text-blue-600 rounded shadow-sm transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleMilestoneDelete(m.id)}
                                className="p-1 bg-white hover:bg-red-50 border border-gray-200 text-gray-500 hover:text-red-600 rounded shadow-sm transition-colors cursor-pointer"
                                title="Xoá"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    loadingSchedules ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-sm">
                        <Loader2 className="animate-spin text-blue-600" size={18} />
                        <span>Đang tải lịch trình...</span>
                      </div>
                    ) : schedules.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 text-sm">
                        Chưa có sự kiện lịch trình nào được tạo.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {schedules.map((s, idx) => (
                          <div key={s.id} className="flex gap-3 items-start p-3.5 bg-gray-50 rounded-xl border border-gray-150 relative group">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0 font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0 pr-16 text-left">
                              <h5 className="font-bold text-gray-900 text-sm">{s.title}</h5>
                              {s.description && <p className="text-gray-500 text-xs mt-1">{s.description}</p>}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                {s.location && (
                                  <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                                    <MapPin size={12} />
                                    <span>{s.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                  <Clock size={12} className="text-purple-500" />
                                  <span>
                                    {new Date(s.startTime).toLocaleString('vi-VN')} 
                                    {s.endTime && ` - ${new Date(s.endTime).toLocaleString('vi-VN')}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingSchedule(s);
                                  setScheduleForm({
                                    title: s.title,
                                    description: s.description || '',
                                    startTime: s.startTime ? s.startTime.slice(0, 16) : '',
                                    endTime: s.endTime ? s.endTime.slice(0, 16) : '',
                                    location: s.location || '',
                                  });
                                }}
                                className="p-1 bg-white hover:bg-blue-50 border border-gray-200 text-gray-500 hover:text-blue-600 rounded shadow-sm transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleScheduleDelete(s.id)}
                                className="p-1 bg-white hover:bg-red-50 border border-gray-200 text-gray-500 hover:text-red-600 rounded shadow-sm transition-colors cursor-pointer"
                                title="Xoá"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>

              </>
              )}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={() => setSelectedHackathonForTimeline(null)}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ── Phân công Giám khảo Modal ── */}
        {showAssignmentsModal && selectedJudgeForAssignments && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Phân công chấm thi
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Giám khảo: <span className="font-semibold text-gray-800">{selectedJudgeForAssignments.username}</span> ({selectedJudgeForAssignments.email})
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowAssignmentsModal(false);
                    setSelectedJudgeForAssignments(null);
                  }} 
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-xs text-gray-500 font-medium text-left">
                  Tích chọn các đội thi mà Giám khảo này có nhiệm vụ đánh giá và chấm điểm.
                </p>

                {teamsList.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Chưa có đội thi nào trong hệ thống để phân công.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {teamsList.map(team => {
                      const isAssigned = assignments.some(
                        a => Number(a.judgeId) === Number(selectedJudgeForAssignments.id) && Number(a.teamId) === Number(team.id)
                      );
                      return (
                        <div 
                          key={team.id} 
                          onClick={() => handleToggleAssignment(Number(selectedJudgeForAssignments.id), Number(team.id))}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isAssigned 
                              ? 'bg-purple-50/50 border-purple-300 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {}} // toggle is handled by parent div onClick
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-bold text-gray-900 text-sm truncate">{team.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{team.category}</p>
                            {team.project ? (
                              <p className="text-[11px] text-purple-600 font-medium truncate mt-1">
                                Dự án: {team.project.name}
                              </p>
                            ) : (
                              <p className="text-[11px] text-gray-400 italic mt-1">Chưa nộp dự án</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
                <button
                  onClick={() => {
                    setShowAssignmentsModal(false);
                    setSelectedJudgeForAssignments(null);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
