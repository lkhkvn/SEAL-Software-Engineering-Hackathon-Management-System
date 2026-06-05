import { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface AdminPageProps {
  currentUser: any;
}

interface Contest {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  max_teams: number;
  status: string;
  prize?: string;
  image?: string;
  schedule?: string;
  prize_details?: string;
  rules?: string;
  created_at: string;
}

const EMPTY_FORM: Omit<Contest, 'id' | 'created_at'> = {
  name: '',
  category: 'AI & ML',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  max_teams: 50,
  status: 'UPCOMING',
  prize: '',
  image: '',
  schedule: '',
  prize_details: '',
  rules: '',
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

export function AdminPage({ currentUser }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // ── Phân quyền ──
  const [users, setUsers]               = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError]       = useState<string | null>(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // ── Cuộc thi ──
  const [contests, setContests]         = useState<Contest[]>([]);
  const [loadingContests, setLoadingContests] = useState(false);
  const [contestError, setContestError] = useState<string | null>(null);
  const [contestSearch, setContestSearch] = useState('');

  // Modal tạo / chỉnh sửa
  const [showModal, setShowModal]       = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [formData, setFormData]         = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState<string | null>(null);

  // Confirm xoá
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Contest | null>(null);

  // Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAdmin = currentUser && currentUser.role?.toUpperCase() === 'ADMIN';

  const toast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Fetch users ──
  useEffect(() => {
    if (activeTab === 'permissions' && isAdmin) fetchUsers();
  }, [activeTab, isAdmin]);

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
    } finally {
      setUpdatingUserId(null);
    }
  };

  // ── Fetch contests ──
  useEffect(() => {
    if (activeTab === 'events') fetchContests();
  }, [activeTab]);

  const fetchContests = async () => {
    setLoadingContests(true);
    setContestError(null);
    try {
      const res = await fetch('http://localhost:8000/index.php/api/contests');
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setContests(result.data || []);
    } catch (e: any) {
      setContestError(e.message || 'Lỗi tải danh sách cuộc thi.');
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

  const openEdit = (c: Contest) => {
    setEditingContest(c);
    setFormData({
      name: c.name,
      category: c.category,
      description: c.description || '',
      location: c.location || '',
      start_date: c.start_date?.slice(0, 10) || '',
      end_date: c.end_date?.slice(0, 10) || '',
      max_teams: c.max_teams,
      status: c.status,
      prize: c.prize || '',
      image: c.image || '',
      schedule: c.schedule || '',
      prize_details: c.prize_details || '',
      rules: c.rules || '',
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

    if (!formData.name.trim() || !formData.category || !formData.start_date || !formData.end_date) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }
    if (formData.end_date < formData.start_date) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const isEdit = !!editingContest;
      const url = isEdit
        ? `http://localhost:8000/index.php/api/admin/contests/${editingContest!.id}`
        : 'http://localhost:8000/index.php/api/admin/contests';

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);

      toast('success', isEdit ? `Đã cập nhật cuộc thi "${formData.name}"!` : `Đã tạo cuộc thi "${formData.name}"!`);
      closeModal();
      fetchContests();
    } catch (e: any) {
      setFormError(e.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Xoá ──
  const handleDelete = async (contest: Contest) => {
    setDeletingId(contest.id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8000/index.php/api/admin/contests/${contest.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status === 'error') throw new Error(result.message);
      setContests(prev => prev.filter(c => c.id !== contest.id));
      toast('success', result.message || 'Đã xoá cuộc thi thành công!');
    } catch (e: any) {
      toast('error', e.message || 'Không thể xoá cuộc thi.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
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
    { label: 'Tổng cuộc thi',        value: String(contests.length || '—'), icon: Calendar,  color: 'blue' },
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {editingContest ? <Pencil size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />}
                {editingContest ? 'Chỉnh sửa cuộc thi' : 'Tạo cuộc thi mới'}
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

              {/* Tên sự kiện */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tên cuộc thi <span className="text-red-500">*</span>
                </label>
                <input
                  id="contest-name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="VD: AI Innovation Hackathon 2026"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

              {/* Ngày bắt đầu + Ngày kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-start-date"
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contest-end-date"
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số đội tối đa</label>
                  <input
                    id="contest-max-teams"
                    type="number"
                    min={1}
                    value={formData.max_teams}
                    onChange={e => setFormData(p => ({ ...p, max_teams: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Giải thưởng + Ảnh bìa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giải thưởng</label>
                  <input
                    id="contest-prize"
                    type="text"
                    value={formData.prize}
                    onChange={e => setFormData(p => ({ ...p, prize: e.target.value }))}
                    placeholder="VD: 150.000.000 VNĐ"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh bìa (URL / Mã màu)</label>
                  <input
                    id="contest-image"
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData(p => ({ ...p, image: e.target.value }))}
                    placeholder="VD: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả ngắn</label>
                <textarea
                  id="contest-description"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Nhập mô tả ngắn về cuộc thi..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Lịch trình */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lịch trình</label>
                <textarea
                  id="contest-schedule"
                  rows={3}
                  value={formData.schedule}
                  onChange={e => setFormData(p => ({ ...p, schedule: e.target.value }))}
                  placeholder="Nhập lịch trình cuộc thi..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Giải thưởng chi tiết */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chi tiết giải thưởng sự kiện</label>
                <textarea
                  id="contest-prize-details"
                  rows={3}
                  value={formData.prize_details}
                  onChange={e => setFormData(p => ({ ...p, prize_details: e.target.value }))}
                  placeholder="Nhập chi tiết cơ cấu giải thưởng..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Thể lệ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thể lệ cuộc thi</label>
                <textarea
                  id="contest-rules"
                  rows={3}
                  value={formData.rules}
                  onChange={e => setFormData(p => ({ ...p, rules: e.target.value }))}
                  placeholder="Nhập thể lệ và quy định..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                form=""
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-60"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingContest ? <Pencil size={16} /> : <Plus size={16} />)}
                {editingContest ? 'Lưu thay đổi' : 'Tạo cuộc thi'}
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
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-sm"
              >
                <Plus size={18} />
                Tạo cuộc thi mới
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {['overview', 'events', 'permissions', 'settings'].map(tab => (
              <button
                key={tab}
                id={`admin-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab === 'overview'     && 'Tổng quan'}
                {tab === 'events'       && 'Quản lý sự kiện'}
                {tab === 'permissions'  && 'Phân quyền'}
                {tab === 'settings'     && 'Cài đặt'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════ CONTENT ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Tab: Tổng quan ── */}
        {activeTab === 'overview' && (
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

            {/* Danh sách cuộc thi gần đây */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Cuộc thi gần đây</h2>
                <button onClick={() => setActiveTab('events')} className="text-sm text-blue-600 font-semibold hover:underline">
                  Xem tất cả →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên cuộc thi</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contests.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{c.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_LABELS[c.status] ?? c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{c.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{c.start_date?.slice(0,10)} → {c.end_date?.slice(0,10)}</td>
                      </tr>
                    ))}
                    {contests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                          Chưa có cuộc thi nào. Hãy tạo cuộc thi đầu tiên!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Quản lý sự kiện (CRUD) ── */}
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
              <span className="text-sm text-gray-500">
                {filteredContests.length} / {contests.length} cuộc thi
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
                <span className="text-sm text-gray-500 font-medium">Đang tải danh sách cuộc thi...</span>
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
                            <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{c.name}</h3>
                            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[c.status] ?? c.status}
                            </span>
                          </div>

                          {c.description && (
                            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{c.description}</p>
                          )}

                          <div className="space-y-1.5">
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
                              <span>{c.start_date?.slice(0,10)} → {c.end_date?.slice(0,10)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Hash size={13} className="text-green-400" />
                              <span>Tối đa {c.max_teams} đội</span>
                            </div>
                            {c.prize && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Trophy size={13} className="text-yellow-500" />
                                <span className="font-semibold">{c.prize}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: actions */}
                        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
                          <span className="text-xs text-gray-400">#{c.id}</span>
                          <div className="flex gap-2">
                            <button
                              id={`btn-view-contest-${c.id}`}
                              className="p-1.5 hover:bg-white hover:shadow rounded-lg transition-all text-gray-400 hover:text-gray-600"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              id={`btn-edit-contest-${c.id}`}
                              onClick={() => openEdit(c)}
                              className="p-1.5 hover:bg-blue-50 hover:shadow rounded-lg transition-all text-gray-400 hover:text-blue-600"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              id={`btn-delete-contest-${c.id}`}
                              onClick={() => setConfirmDelete(c)}
                              disabled={deletingId === c.id}
                              className="p-1.5 hover:bg-red-50 hover:shadow rounded-lg transition-all text-gray-400 hover:text-red-500 disabled:opacity-40"
                              title="Xoá cuộc thi"
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
                    <p className="text-gray-500 font-medium">Không có cuộc thi nào phù hợp</p>
                    <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khoá tìm kiếm hoặc tạo cuộc thi mới</p>
                    <button
                      onClick={openCreate}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} /> Tạo cuộc thi đầu tiên
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
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
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cài đặt hệ thống</h2>
            <p className="text-gray-500">Tính năng cài đặt đang được phát triển...</p>
          </div>
        )}
      </div>
    </div>
  );
}
