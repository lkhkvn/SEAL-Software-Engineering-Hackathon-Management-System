import re
import sys

filepath = 'd:/SEAL/SEAL-Software-Engineering-Hackathon-Management-System/SEAL/Frontend/src/app/components/EventDetailPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('  const tabs = [')
if start_idx == -1:
    print('Could not find start index.')
    sys.exit(1)

end_idx = content.find('      {/* Modal Đăng ký Tham gia */}')
if end_idx == -1:
    print('Could not find end index.')
    sys.exit(1)

content_before = content[:start_idx]
content_after = content[end_idx:]

new_jsx = """  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: Info },
    { id: 'schedule', label: 'Dòng Thời Gian', icon: Clock },
    { id: 'rules', label: 'Quy Tắc', icon: FileText },
    { id: 'prizes', label: 'Giải Thưởng', icon: Trophy },
    { id: 'challenge', label: 'Dự Án', icon: BookOpen },
    { id: 'participants', label: 'Người Tham Gia', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Full-width Cover Image */}
      <div className="w-full h-64 lg:h-80 bg-cover bg-center" style={{
         backgroundImage: event.image && (event.image.startsWith('http') || event.image.startsWith('/')) 
           ? `url(${event.image})` 
           : 'none',
         background: !(event.image && (event.image.startsWith('http') || event.image.startsWith('/'))) ? event.image : 'none'
      }}></div>

      {/* 2. Sticky Tab Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Logo overlapping the cover and tab bar */}
          <div className="absolute -top-16 left-4 sm:left-6 lg:left-8 w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md z-50 flex items-center justify-center">
            {eventData.logo_url ? (
              <img src={eventData.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#111827] text-white font-bold flex flex-col items-center justify-center text-center p-2 text-sm">
                <span className="text-orange-500 font-black text-lg">PORTO HACK</span>
                <span className="text-xs tracking-widest mt-1">SANTOS 2026</span>
              </div>
            )}
          </div>

          <div className="flex overflow-x-auto hide-scrollbar pl-40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div>
               <h1 className="text-4xl font-bold text-blue-900 mb-3">{event.name}</h1>
               <p className="text-gray-700 font-medium mb-6">{event.description}</p>
               
               {/* Registration Button */}
               {isTeamRegistered && event.status === 'Đang diễn ra' ? (
                 <button onClick={() => navigate(`/submit`)} className="block w-full py-3 mb-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md">Nộp Dự Án</button>
               ) : isRegistrationClosed ? (
                 <button disabled className="block w-full py-3 mb-3 bg-gray-300 text-gray-500 rounded-lg font-bold cursor-not-allowed">Đã hết hạn đăng ký</button>
               ) : (
                 <button onClick={handleOpenRegisterModal} className="block w-full py-3 mb-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                   THAM GIA HACKATHON
                 </button>
               )}

               <button className="block w-full py-3 mb-3 bg-[#4F39F6] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                 <Info size={18} /> REGULAMENTO OFFICIAL
               </button>
               <button className="block w-full py-3 mb-6 bg-[#4F39F6] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                 <FileText size={18} /> HƯỚNG DẪN THAM GIA
               </button>
               
               <div className="mt-8 border-t border-gray-100 pt-6">
                 <h3 className="font-bold text-gray-900 mb-4 text-lg">Dòng thời gian</h3>
                 <div className="space-y-5 text-sm">
                   <div>
                     <div className="text-gray-900 font-semibold mb-1">Đăng ký</div>
                     <div className="text-gray-600">
                       {eventData.start_date ? new Date(eventData.start_date).toLocaleString('vi-VN', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '12 tháng 6 năm 2026 - 10:00'}
                     </div>
                   </div>
                   <div>
                     <div className="text-gray-900 font-semibold mb-1">Danh sách hy vọng</div>
                     <div className="text-gray-600">
                       {eventData.end_date ? new Date(eventData.end_date).toLocaleString('vi-VN', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : '13 tháng 7 năm 2026 - 10:00'}
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-transparent p-0">
               
               {/* OVERVIEW TAB */}
               {activeTab === 'overview' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6">Bem-vindo(a) ao {event.name}</h2>
                    <p className="mb-4">Essa é a nossa 6ª edição esta é a plataforma oficial onde toda a jornada acontecerá.</p>
                    <p className="mb-8 font-semibold">Comece por aqui: esta aba reúne tudo o que você precisa saber. Hỗ trợ bạn làm một ví dụ để saber có thể đảm bảo một bản ghi như vậy.</p>
                    
                    {/* Fake Video Block */}
                    <div className="w-full bg-gray-900 rounded-xl overflow-hidden shadow-md flex flex-col justify-end p-6 relative min-h-[300px]">
                      <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')"}}></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">gu</div>
                        <div className="text-white">
                          <div className="font-bold text-xl">Comece por aqui: boas-vindas e como se inscrever</div>
                          <div className="text-gray-300">Instituto AmiGU</div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mt-10 mb-4 text-blue-900">Regras</h3>
                    <p className="mb-4 text-gray-700">Bạn có thể tham gia vào quy định của {event.name}: bạn có thể tham gia, bạn có thể tham gia vào thời điểm đó, bạn có thể đăng ký, bạn có thể tham gia, hoặc bạn có thể tham gia dễ dàng và có thể thỏa hiệp với những việc cần làm. Vale a leitura antes de se inscrever, porque é aqui que estão as respostas para a maioria das dúvidas.</p>
                    <p className="text-gray-400 mb-8">Trường hợp này có nhiều vấn đề khác nhau trong trang này. Quy định chính thức, phổ biến hoặc Quy định chính thức.</p>
                    
                    <h3 className="text-2xl font-bold mt-8 mb-4 text-blue-900">Quem pode participar</h3>
                    <p className="mb-4 text-gray-700">Bộ lọc không có kinh nghiệm. Ý tôi là. Nếu bạn đang làm việc ở đây, bạn không cần phải thiết lập cổng thông tin và xây dựng trải nghiệm thực tế của mình, đây là chương trình dành cho bạn.</p>
                    
                    <h4 className="font-bold text-lg mt-6 mb-3 text-gray-900">Você pode participar se:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Phần 18 sau đây sẽ được ghi lại bằng dữ liệu.</li>
                      <li>Đây là một trường trúng tuyển (a) tại học viện nghiên cứu của MEC, sinh viên tốt nghiệp, vượt qua khó khăn, vượt qua học kỳ.</li>
                      <li>Đây là một trường đại học (a) trong khóa học về công nghệ mới (18+) và busca vaga de estágio, mantendo matrícula ativa.</li>
                      <li>Là một chuyên gia về công nghệ, MBA hoặc chuyên môn (theo nghĩa), theo đuổi các tiêu chí.</li>
                    </ul>
                 </div>
               )}

               {/* TIMELINE TAB */}
               {activeTab === 'schedule' && (
                 <div className="space-y-6 text-gray-800 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 pb-4">Dòng thời gian Châu Á/Bangkok (UTC+7)</h2>
                    
                    <div className="relative border-l border-gray-200 ml-3 space-y-10 py-4">
                      {/* Timeline Item 1 */}
                      <div className="relative pl-8">
                         <div className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-[#ff7a45]"></div>
                         <div className="text-sm text-gray-400 mb-1">5/6/2026 10:00</div>
                         <div className="text-lg font-medium text-gray-900">Đăng ký trước</div>
                      </div>
                      
                      {/* Timeline Item 2 */}
                      <div className="relative pl-8">
                         <div className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-[#ff7a45]"></div>
                         <div className="text-sm text-gray-400 mb-1">12/6/2026 10:00</div>
                         <div className="text-lg font-medium text-gray-900">Đăng ký</div>
                      </div>
                      
                      {/* Timeline Item 3 */}
                      <div className="relative pl-8">
                         <div className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300"></div>
                         <div className="text-sm text-gray-400 mb-1">13/7/2026 10:00</div>
                         <div className="text-lg font-medium text-gray-900">Danh sách hy vọng</div>
                      </div>
                      
                      {/* Timeline Item 4 */}
                      <div className="relative pl-8">
                         <div className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-gray-300"></div>
                         <div className="text-sm text-gray-400 mb-1">21/7/2026 05:00</div>
                         <div className="text-lg font-medium text-gray-900">Imersão Dia 1 - Onboarding</div>
                      </div>
                    </div>
                 </div>
               )}

               {activeTab !== 'overview' && activeTab !== 'schedule' && (
                 <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center py-20">
                    <p className="text-gray-500 text-lg">Nội dung chi tiết cho tab này đang được cập nhật.</p>
                 </div>
               )}
            </div>
          </div>

        </div>
      </div>

"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content_before + new_jsx + content_after)

print('Rewrite successful.')
