import { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Play, Github, FileText, LayoutDashboard, Camera, Users, Link as LinkIcon, Loader2, Save, PlayCircle, Calendar, FileUp } from 'lucide-react';

export function SubmissionPage() {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(true);
  const [hasTeam, setHasTeam] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    contestId: '',
    projectName: '',
    description: '',
    githubUrl: '',
    demoVideoUrl: '',
  });
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.contestId) return;

    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:8000/index.php/api/teams/my-team/submission?contestId=${formData.contestId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setFormData(prev => ({
            ...prev,
            projectName: data.data.projectName || '',
            description: data.data.description || '',
            githubUrl: data.data.githubUrl || '',
            demoVideoUrl: data.data.demoVideoUrl || '',
          }));
          setExistingFile(data.data.fileUrl || null);
        } else {
          setFormData(prev => ({
            ...prev,
            projectName: '',
            description: '',
            githubUrl: '',
            demoVideoUrl: '',
          }));
          setExistingFile(null);
        }
      } catch (err) {
        console.error("Error fetching existing submission", err);
      }
    };
    fetchSubmission();
  }, [formData.contestId]);

  const [projectAvatar, setProjectAvatar] = useState<File | null>(null);
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.name === 'projectFile') {
        setProjectFile(e.target.files[0]);
      } else if (e.target.name === 'projectAvatar') {
        setProjectAvatar(e.target.files[0]);
      } else if (e.target.name === 'teamLogo') {
        setTeamLogo(e.target.files[0]);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        // Fetch team info to check leadership
        const teamRes = await fetch('http://localhost:8000/index.php/api/users/me/team', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const teamData = await teamRes.json();
        
        if (teamRes.ok && teamData.status === 'success' && teamData.data) {
          setHasTeam(true);
          setIsLeader(teamData.data.isLeader);
        } else {
          setHasTeam(false);
        }

        // Fetch registered hackathons for the team
        const hackRes = await fetch('http://localhost:8000/index.php/api/teams/my-team/contests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const hackData = await hackRes.json();
        if (hackRes.ok && hackData.status === 'success') {
          setHackathons(hackData.data || []);
          if (hackData.data && hackData.data.length > 0) {
            setFormData(prev => ({ ...prev, contestId: hackData.data[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (projectFile) {
        submitData.append('projectFile', projectFile);
      }
      if (projectAvatar) {
        submitData.append('projectAvatar', projectAvatar);
      }
      if (teamLogo) {
        submitData.append('teamLogo', teamLogo);
      }

      const response = await fetch('http://localhost:8000/index.php/api/teams/my-team/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Lỗi nộp dự án');
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Upload size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Nộp Dự Án (Submission)</h1>
          <p className="text-gray-500 mt-2">Nộp kết quả sản phẩm của đội bạn trước khi thời gian kết thúc.</p>
          {existingFile && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
              <CheckCircle size={16} />
              Đội của bạn đã nộp bài. Bạn có thể cập nhật thông tin nếu chưa tới hạn.
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {!hasTeam ? (
          <div className="bg-yellow-50 text-yellow-700 p-6 rounded-xl border border-yellow-200 text-center flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">Chưa tham gia đội thi</h2>
            <p>Bạn cần phải tham gia một đội thi trước khi có thể nộp dự án.</p>
          </div>
        ) : !isLeader ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Không đủ quyền truy cập</h2>
            <p>Chỉ <strong>Đội trưởng</strong> mới có quyền nộp hoặc cập nhật dự án cho đội thi.</p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="bg-orange-50 text-orange-700 p-6 rounded-xl border border-orange-200 text-center flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Chưa được duyệt tham gia</h2>
            <p>Đội của bạn chưa được Admin duyệt tham gia bất kỳ cuộc thi nào, hoặc cuộc thi đã kết thúc. Vui lòng chờ Admin duyệt để có thể nộp dự án.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 md:p-8 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" /> Chọn Sự Kiện <span className="text-red-500">*</span>
                </label>
                <select 
                  name="contestId" 
                  value={formData.contestId} 
                  onChange={handleChange as any} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>-- Lựa chọn sự kiện --</option>
                  {hackathons.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên dự án <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="projectName" 
                required
                value={formData.projectName} 
                onChange={handleChange} 
                placeholder="Ví dụ: Hệ thống AI phân tích y tế..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" /> Mô tả chi tiết dự án <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Trình bày vấn đề giải quyết, giải pháp và công nghệ sử dụng.</p>
              <textarea 
                name="description" 
                required
                value={formData.description} 
                onChange={handleChange} 
                rows={6}
                placeholder="Dự án của chúng tôi giải quyết vấn đề..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Camera size={16} className="text-gray-400" />
                  Ảnh đại diện dự án (Thumbnail)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                        <span>Tải ảnh lên</span>
                        <input name="projectAvatar" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                    {projectAvatar && (
                      <p className="text-sm text-green-600 font-medium mt-2 break-all">
                        Đã chọn: {projectAvatar.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  Logo đội thi
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
                  <div className="space-y-1 text-center">
                    <Users className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                        <span>Tải logo lên</span>
                        <input name="teamLogo" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG (Khuyên dùng ảnh vuông)</p>
                    {teamLogo && (
                      <p className="text-sm text-green-600 font-medium mt-2 break-all">
                        Đã chọn: {teamLogo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <LinkIcon size={18} className="text-gray-400" /> URL Mã nguồn (GitHub)
                </label>
                <input 
                  type="url" 
                  name="githubUrl" 
                  value={formData.githubUrl} 
                  onChange={handleChange} 
                  placeholder="https://github.com/..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <PlayCircle size={18} className="text-gray-400" /> URL Video Demo
                </label>
                <input 
                  type="url" 
                  name="demoVideoUrl" 
                  value={formData.demoVideoUrl} 
                  onChange={handleChange} 
                  placeholder="https://youtube.com/..." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileUp size={18} className="text-gray-400" /> Tệp đính kèm (PDF, ZIP, DOCX, RAR)
                </label>
                {existingFile && !projectFile && (
                  <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500"/>
                    Đã nộp tệp: <a href={`http://localhost:8000${existingFile}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem tệp hiện tại</a>
                  </div>
                )}
                <input 
                  type="file" 
                  name="projectFile" 
                  onChange={handleFileChange} 
                  accept=".pdf,.zip,.docx,.doc,.rar"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                <p className="text-xs text-gray-500 mt-2">Chọn tệp mới nếu bạn muốn thay thế tệp đã nộp.</p>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle size={16} className="mr-1" />
                Nộp dự án thành công!
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold transition-colors shadow-md hover:shadow-lg"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {existingFile ? "Cập nhật dự án" : "Nộp dự án"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
