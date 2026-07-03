import { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Tag, ChevronRight, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('all');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('http://localhost:8000/index.php/api/blogs');
        const result = await res.json();
        if (result.status === 'success') {
          setBlogs(result.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Lọc danh sách tag duy nhất từ data
  const allTags = Array.from(
    new Set(blogs.flatMap(blog => blog.tags || []))
  );

  const filteredBlogs = activeTag === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.tags && blog.tags.includes(activeTag));

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
              SEAL <span className="text-blue-600">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 font-light mb-10">
              Cập nhật những tin tức mới nhất, hướng dẫn kỹ thuật và chia sẻ kinh nghiệm từ cộng đồng lập trình viên.
            </p>
            
            {/* Thanh tìm kiếm mô phỏng */}
            <div className="relative max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="Tìm kiếm bài viết..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tags filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <button
            onClick={() => setActiveTag('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
              activeTag === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            Tất cả
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                activeTag === tag
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
            <p>Đang tải bài viết...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="group flex flex-col h-full cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-100 shadow-sm border border-gray-100">
                  <img 
                    src={blog.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.title)}&background=random`} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {blog.tags[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      {blog.author}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {blog.summary}
                  </p>
                  
                  <div className="mt-auto flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition-colors">
                    Đọc tiếp <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}

            {filteredBlogs.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500">
                Không tìm thấy bài viết nào phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
