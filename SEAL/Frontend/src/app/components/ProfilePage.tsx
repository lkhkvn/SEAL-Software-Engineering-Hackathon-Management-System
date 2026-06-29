import { useState, useEffect, useRef } from 'react';
import { User, Mail, Briefcase, FileText, Link as LinkIcon, Loader2, Save, CheckCircle, Calendar, Edit2, X, Camera, Phone, GraduationCap, Code } from 'lucide-react';

export function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    avatarUrl: '',
    dateOfBirth: ''
  });

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
        cvSummary: data.summary || data.cv_summary || '',
        cvEducation: data.education || data.cv_education || '',
        cvExperience: data.experience || data.cv_experience || '',
        cvPortfolioUrl: data.portfolioUrl || data.cv_portfolio_url || '',
        avatarUrl: data.avatarUrl || data.avatar_url || '',
        dateOfBirth: data.dateOfBirth || data.date_of_birth || ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const SKILLS_LIST = [
    'React', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'PHP', 'UI/UX Design', 'DevOps', 'Mobile App', 'AI/ML'
  ];

  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (currentSkills.includes(skill)) {
      setFormData({ ...formData, skills: currentSkills.filter(s => s !== skill).join(', ') });
    } else {
      setFormData({ ...formData, skills: [...currentSkills, skill].join(', ') });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          name: formData.name,
          phone: formData.phone,
          skills: formData.skills,
          summary: formData.cvSummary,
          education: formData.cvEducation,
          experience: formData.cvExperience,
          portfolioUrl: formData.cvPortfolioUrl,
          dateOfBirth: formData.dateOfBirth
        })
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Lỗi lưu hồ sơ');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
        fetchProfile(); // Reload to get fresh data
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formDataObj = new FormData();
    formDataObj.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/index.php/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Lỗi upload ảnh');
      }
      
      setFormData(prev => ({ ...prev, avatarUrl: result.data.avatarUrl }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const avatarDisplayUrl = formData.avatarUrl 
    ? (formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:8000${formData.avatarUrl}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D8ABC&color=fff&size=150`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-12">
      {/* Cover Banner */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-32 right-12 w-64 h-64 rounded-full bg-blue-300 blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative">
          
          {/* Avatar */}
          <div className="relative group -mt-20 sm:-mt-24">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative">
              <img 
                src={avatarDisplayUrl} 
                alt="Avatar" 
                className={`w-full h-full object-cover ${uploadingAvatar ? 'opacity-50' : ''}`}
              />
              {isEditing && (
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="text-white" size={32} />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name || 'Người dùng'}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-gray-600">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{formData.role || 'Tham gia'}</span>
              {formData.email && (
                <span className="flex items-center gap-1"><Mail size={16} /> {formData.email}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            {isEditing ? (
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-xl transition-colors"
              >
                <X size={18} /> Hủy
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-xl shadow-sm shadow-blue-200 transition-colors"
              >
                <Edit2 size={18} /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-2">
            <X size={20} /> {error}
          </div>
        )}

        {isEditing ? (
          /* EDIT MODE */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cột trái */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="text-blue-600" size={20} /> Thông tin cá nhân
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="0123456789" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ học vấn</label>
                      <select name="cvEducation" value={formData.cvEducation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Chọn trình độ</option>
                        <option value="Học sinh THPT">Học sinh THPT</option>
                        <option value="Sinh viên Đại học">Sinh viên Đại học</option>
                        <option value="Cử nhân/Kỹ sư">Cử nhân/Kỹ sư</option>
                        <option value="Thạc sĩ">Thạc sĩ</option>
                        <option value="Tự học">Tự học</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="text-blue-600" size={20} /> Chuyên môn & Kỹ năng
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
                      <textarea name="cvSummary" value={formData.cvSummary} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Viết vài dòng giới thiệu về bạn..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng công nghệ</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {SKILLS_LIST.map((skill) => {
                          const isSelected = formData.skills.split(',').map(s => s.trim()).includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              className={`px-4 py-1.5 text-sm rounded-full border transition-all ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                              }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                      <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Hoặc nhập kỹ năng khác cách nhau bằng dấu phẩy..." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm dự án nổi bật</label>
                      <textarea name="cvExperience" value={formData.cvExperience} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Mô tả các dự án bạn đã làm..." />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><LinkIcon size={16} /> Liên kết Portfolio / GitHub</label>
                      <input type="url" name="cvPortfolioUrl" value={formData.cvPortfolioUrl} onChange={handleChange} placeholder="https://github.com/your-username" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4">
                  {saveSuccess && (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle size={18} className="mr-1" /> Lưu thành công!
                    </span>
                  )}
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-all shadow-lg shadow-blue-200">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Lưu hồ sơ
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* VIEW MODE (Taikai Style) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cột trái */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Card Liên hệ & Thông tin */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Thông tin cá nhân</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                      <p className="text-gray-800">{formData.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Số điện thoại</p>
                      <p className="text-gray-800">{formData.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ngày sinh</p>
                      <p className="text-gray-800">{formData.dateOfBirth || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Học vấn</p>
                      <p className="text-gray-800">{formData.cvEducation || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  {formData.cvPortfolioUrl && (
                    <div className="flex items-start gap-3">
                      <LinkIcon className="text-blue-500 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Portfolio / GitHub</p>
                        <a href={formData.cvPortfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {formData.cvPortfolioUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Kỹ năng */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Code className="text-blue-600" size={20} /> Kỹ năng
                </h3>
                {formData.skills ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">Chưa cập nhật kỹ năng.</p>
                )}
              </div>
            </div>

            {/* Cột phải */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card Giới thiệu */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={22} /> Giới thiệu bản thân
                </h3>
                <div className="prose prose-blue max-w-none text-gray-700">
                  {formData.cvSummary ? (
                    <p className="whitespace-pre-line leading-relaxed">{formData.cvSummary}</p>
                  ) : (
                    <p className="text-gray-500 italic">Người dùng chưa thêm lời giới thiệu nào.</p>
                  )}
                </div>
              </div>

              {/* Card Kinh nghiệm */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={22} /> Kinh nghiệm & Dự án
                </h3>
                <div className="prose prose-blue max-w-none text-gray-700">
                  {formData.cvExperience ? (
                    <p className="whitespace-pre-line leading-relaxed">{formData.cvExperience}</p>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có thông tin kinh nghiệm dự án.</p>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
