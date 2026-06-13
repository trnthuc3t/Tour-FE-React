import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import realtimeChatService from '../services/realtimeChatService';
import apiClient from '../services/apiClient';

function formatTime(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function plainTextFromHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

function OdooLiveChat() {
  const { isAuthenticated, loading } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const knownMessageIdsRef = useRef(new Set());
  const endRef = useRef(null);

  const token = localStorage.getItem('auth_token') || '';

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (loading || !isAuthenticated || !token) {
      return undefined;
    }

    let disposed = false;

    const fetchChatHistory = async (channelId) => {
      try {
        const response = await apiClient.get('/api/rt-chat/messages', {
          params: { channel_id: channelId, after_id: 0 }
        });
        if (disposed) return;
        if (response.data && response.data.code === 200) {
          const historyMessages = response.data.response.messages || [];
          setMessages((prev) => {
            const historyIds = new Set(historyMessages.map(m => Number(m.id)));
            const newMessages = prev.filter(m => !historyIds.has(Number(m.id)));
            
            historyMessages.forEach(msg => {
              if (msg.id) {
                knownMessageIdsRef.current.add(Number(msg.id));
              }
            });
            
            return [...historyMessages, ...newMessages];
          });
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };

    const connect = () => {
      if (disposed) return;

      setStatus('Connecting...');
      setError('');

      socketRef.current = realtimeChatService.createRealtimeChatSocket({
        onOpen: (socket) => {
          setStatus('Connected');
          socket.send(JSON.stringify({ type: 'init', token }));
        },
        onMessage: (payload) => {
          if (payload.type === 'ready') {
            setStatus('Ready');
            fetchChatHistory(payload.payload.channel_id);
            return;
          }
          if (payload.type === 'message' && payload.payload) {
            const incomingId = Number(payload.payload.id || 0);
            if (incomingId && knownMessageIdsRef.current.has(incomingId)) {
              return;
            }
            if (incomingId) {
              knownMessageIdsRef.current.add(incomingId);
            }
            setMessages((prev) => [...prev, payload.payload]);
            return;
          }
          if (payload.type === 'error') {
            setError(payload.message || 'Unknown error');
          }
        },
        onError: (err) => {
          setError(err.message || 'Connection error');
        },
        onClose: () => {
          setStatus('Disconnected');
          if (!disposed) {
            reconnectTimerRef.current = setTimeout(connect, 2000);
          }
        },
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
      knownMessageIdsRef.current.clear();
      setMessages([]);
    };
  }, [isAuthenticated, loading, token]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    socketRef.current.send(JSON.stringify({ type: 'send', message: content }));
    setInput('');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] rounded-3xl overflow-hidden border border-white/20 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-[#003974] to-[#00509d] text-white flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <span className="material-symbols-outlined text-lg text-white">support_agent</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold leading-tight">Hỗ Trợ Admin</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ready' || status === 'Connected' ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
                  <span className="text-[10px] text-white/85 font-semibold">
                    {status === 'Ready' || status === 'Connected' ? 'Đang hoạt động' : status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white bg-white/0 hover:bg-white/10 p-1.5 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Đóng chat"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f8fafc] [scrollbar-width:thin]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-4xl text-[#003974]/30 mb-2">forum</span>
                <p className="text-xs font-bold text-[#191c1e]">Bắt đầu chat với Admin</p>
                <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Hãy gửi tin nhắn của bạn. Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] flex flex-col ${msg.is_mine ? 'ml-auto' : 'mr-auto'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                      msg.is_mine 
                        ? 'bg-[#003974] text-white rounded-tr-none' 
                        : 'bg-white border border-[#e0e3e5] text-[#191c1e] rounded-tl-none'
                    }`}
                  >
                    {!msg.is_mine && (
                      <p className="text-[10px] font-bold text-[#003974] mb-1 leading-none">
                        {msg.author_name || 'Admin'}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{plainTextFromHtml(msg.body)}</p>
                  </div>
                  <span className={`text-[9px] text-gray-400 mt-1 pl-1 ${msg.is_mine ? 'text-right pr-1' : ''}`}>
                    {formatTime(msg.date)}
                  </span>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Footer Input area */}
          <div className="p-3 border-t border-[#e0e3e5] bg-white flex-shrink-0">
            {error && <p className="text-[10px] text-red-600 mb-2 px-1">{error}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 h-10 rounded-full border border-gray-300 px-4 text-xs font-medium focus:outline-none focus:border-[#003974] focus:ring-2 focus:ring-[#003974]/15 bg-gray-50 focus:bg-white transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-[#003974] hover:bg-[#002f5f] disabled:bg-gray-300 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
              >
                <span className="material-symbols-outlined text-white text-base">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#003974] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 hover:bg-[#002f5f] transition-all duration-300"
        title={isOpen ? 'Đóng hỗ trợ' : 'Nhắn tin hỗ trợ với Admin'}
      >
        <span className="material-symbols-outlined text-2xl text-white">
          {isOpen ? 'close' : 'chat'}
        </span>
      </button>
    </>
  );
}

export default OdooLiveChat;
