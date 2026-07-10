import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import Pusher from 'pusher-js';

const API = 'http://localhost:8000/index.php/api';

interface ChatMessage {
  id: number;
  user_id: number;
  user_name: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
}

export function TeamChatWidget({ teamId }: { teamId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const token = localStorage.getItem('auth_token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API}/teams/${teamId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setMessages(data.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
      }
    };
    fetchMessages();

    // 2. Connect to Pusher
    const pusher = new Pusher('b0a454556dfbf62363e1', {
      cluster: 'ap1'
    });

    const channel = pusher.subscribe(`team-chat-${teamId}`);
    channel.bind('new-message', function(data: ChatMessage) {
      setMessages(prev => {
        // Tránh bị đúp tin nhắn nếu là mình gửi (vì đã push cục bộ)
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [teamId, token]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const msg = input.trim();
    setInput('');

    try {
      const res = await fetch(`${API}/teams/${teamId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Thêm ngay vào UI
        setMessages(prev => {
          if (prev.find(m => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 p-4 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        title="Chat nội bộ Đội"
      >
        <MessageSquare size={28} />
      </button>

      <div 
        className={`fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 origin-bottom-right border border-gray-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Chat Nội Bộ</h3>
              <p className="text-xs text-teal-100">Cùng đồng đội tạo ra phép màu!</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-70">
              <MessageSquare size={48} className="mb-2" />
              <p className="text-sm">Chưa có tin nhắn nào.</p>
              <p className="text-xs">Hãy là người gửi tin nhắn đầu tiên!</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.user_id === currentUser.id;
              
              // Nếu tin nhắn liên tiếp từ cùng 1 người, nhóm lại
              const prevMsg = i > 0 ? messages[i-1] : null;
              const isGrouped = prevMsg && prevMsg.user_id === msg.user_id;

              return (
                <div key={msg.id} className={`flex gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
                  {!isMe && !isGrouped && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-300">
                      {msg.avatar_url ? (
                        <img src={`http://localhost:8000/index.php${msg.avatar_url}`} alt={msg.user_name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-gray-400" />
                      )}
                    </div>
                  )}
                  {!isMe && isGrouped && <div className="w-8 h-8 flex-shrink-0"></div>}

                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && !isGrouped && (
                      <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.user_name}</span>
                    )}
                    <div 
                      className={`px-3 py-2 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-teal-600 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                      }`}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent px-3 text-sm focus:outline-none text-gray-700"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send size={16} className="translate-x-[1px] translate-y-[1px]" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
