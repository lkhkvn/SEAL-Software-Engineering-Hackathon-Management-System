import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, FileText, Link as LinkIcon, Loader2, Save, CheckCircle } from 'lucide-react';

export function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    skills: '',
    cvSummary: '',
    cvEducation: '',
    cvExperience: '',
    cvPortfolioUrl: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('Vui lòng đăng nhập');

        const response = await fetch('http://localhost:8000/index.php/api/users/me/cv', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || 'Lỗi tải hồ sơ');
        }

        const data = result.data || {};
        setFormData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          phone: data.phone || '',
          skills: data.skills || '',
          cvSummary: data.cv_summary || '',
          cvEducation: data.cv_education || '',
          cvExperience: data.cv_experience || '',
          cvPortfolioUrl: data.cv_portfolio_url || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/index.php/api/users/me/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          skills: formData.skills,
          cv_summary: formData.cvSummary,
          cv_education: formData.cvEducation,
          cv_experience: formData.cvExperience,
          cv_portfolio_url: formData.cvPortfolioUrl,
        })
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Lỗi lưu hồ sơ');
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-500 mt-2">Cập nhật thông tin CV và kỹ năng để thu hút đồng đội.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Thông tin cơ bản (Readonly mostly) */}
          <div className="p-6 md:p-8 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input type="text" value={formData.name} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input type="email" value={formData.email} disabled className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <input type="text" value={formData.role} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="0123456789" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* CV & Kỹ năng */}
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Chuyên môn & Hồ sơ
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng công nghệ (phân cách bằng dấu phẩy)</label>
                <input 
                  type="text" 
                  name="skills" 
                  value={formData.skills} 
                  onChange={handleChange} 
                  placeholder="React, Node.js, Python, UI/UX..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FileText size={16} /> Giới thiệu bản thân (Summary)
                </label>
                <textarea 
                  name="cvSummary" 
                  value={formData.cvSummary} 
                  onChange={handleChange} 
                  rows={3}
                  placeholder="Tôi là một lập trình viên đam mê..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
                  <input 
                    type="text" 
                    name="cvEducation" 
                    value={formData.cvEducation} 
                    onChange={handleChange} 
                    placeholder="Đại học Công Nghệ..." 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <LinkIcon size={16} /> Portfolio / GitHub URL
                  </label>
                  <input 
                    type="url" 
                    name="cvPortfolioUrl" 
                    value={formData.cvPortfolioUrl} 
                    onChange={handleChange} 
                    placeholder="https://github.com/your-username" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm dự án nổi bật</label>
                <textarea 
                  name="cvExperience" 
                  value={formData.cvExperience} 
                  onChange={handleChange} 
                  rows={4}
                  placeholder="Đã từng tham gia xây dựng..." 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle size={16} className="mr-1" />
                Lưu thành công!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
