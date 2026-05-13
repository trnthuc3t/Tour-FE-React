import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import realtimeChatService from '../services/realtimeChatService';

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
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border border-[#d7dbe0] bg-white shadow-2xl">
          <div className="px-4 py-3 bg-[#003974] text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Chat voi Admin</p>
              <p className="text-[11px] opacity-90">{status}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/15"
              aria-label="Dong chat"
            >
              x
            </button>
          </div>

          <div className="h-[320px] overflow-y-auto px-3 py-3 space-y-2 bg-[#f6f8fb]">
            {messages.length === 0 && (
              <p className="text-xs text-[#5b5f68]">Chua co tin nhan nao.</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 ${msg.is_mine ? 'ml-auto bg-[#003974] text-white' : 'bg-white border border-[#e0e3e5] text-[#191c1e]'}`}
              >
                <p className="text-[11px] opacity-80 mb-1">{msg.author_name || 'Unknown'}</p>
                <p className="text-sm whitespace-pre-wrap">{plainTextFromHtml(msg.body)}</p>
                <p className="text-[10px] opacity-70 mt-1">{formatTime(msg.date)}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-[#e0e3e5] bg-white">
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Nhap tin nhan..."
                className="flex-1 h-10 rounded-lg border border-[#c4c7cf] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003974]/30"
              />
              <button
                onClick={sendMessage}
                className="h-10 px-4 rounded-lg bg-[#003974] text-white text-sm font-semibold hover:opacity-90"
              >
                Gui
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full bg-[#003974] text-white text-sm font-semibold shadow-xl hover:opacity-90"
      >
        {isOpen ? 'Đóng chat' : 'Hỗ trợ 💬'}
      </button>
    </>
  );
}

export default OdooLiveChat;
