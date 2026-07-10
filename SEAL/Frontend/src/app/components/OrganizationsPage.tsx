import { useState, useEffect } from 'react';
import { Building2, LayoutGrid, Link as LinkIcon, Loader2, Users, Trophy, Twitter, Linkedin, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch('http://localhost:8000/index.php/api/organizations');
        const result = await res.json();
        if (result.status === 'success') {
          setOrganizations(result.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 opacity-10 pointer-events-none">
          <Building2 size={400} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full mb-6">
              <Building2 size={48} className="text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
              Tổ chức & Nhà Tài Trợ
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto font-light leading-relaxed">
              Khám phá các doanh nghiệp, cộng đồng và trường đại học đang kiến tạo những sân chơi công nghệ hàng đầu tại hệ sinh thái SEAL.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="text-blue-600" />
            Danh sách Tổ chức
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-1.5 rounded-full">
            {organizations.length} Tổ chức
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p>Đang tải danh sách tổ chức...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full relative">
                {/* Cover Banner */}
                <div className="h-32 w-full bg-gray-100 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-1557683316-${1000 + org.id}?auto=format&fit=crop&q=80&w=800&h=300`} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors">
                      Theo dõi
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 pt-12 flex-1 flex flex-col relative">
                  {/* Logo Overlapping */}
                  <div className="absolute -top-12 left-6">
                    <div className="w-20 h-20 rounded-2xl border-[4px] border-white overflow-hidden bg-white shadow-sm flex items-center justify-center p-2">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt={org.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="text-gray-400 w-10 h-10" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {org.name}
                  </h3>
                  
                  {/* Stats Metrics */}
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-500" />
                      {Math.max(1, org.id % 5 + 1)} Hackathons
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-blue-500" />
                      {1200 + (org.id * 34)} Followers
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {org.description || 'Không có mô tả.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    {/* Website Link */}
                    {org.websiteUrl ? (
                      <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">
                        <LinkIcon size={14} /> Truy cập
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Chưa có website</span>
                    )}

                    {/* Social Links */}
                    <div className="flex items-center gap-3 text-gray-400">
                      <a href="#" className="hover:text-[#1DA1F2] transition-colors"><Twitter size={16} /></a>
                      <a href="#" className="hover:text-[#0A66C2] transition-colors"><Linkedin size={16} /></a>
                      <a href="#" className="hover:text-gray-900 transition-colors"><Github size={16} /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {organizations.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500">
                Chưa có dữ liệu tổ chức nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
