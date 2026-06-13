/**
 * Chatbot Page - RAG-based tour recommendations
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { chatbotService } from '../services/chatbotService';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const renderInlineFormatting = (text) => {
  if (!text) return null;

  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((segment, idx) => {
    const boldMatch = segment.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={`bold_${idx}`} className="font-semibold text-slate-900">
          {boldMatch[1]}
        </strong>
      );
    }
    return <span key={`txt_${idx}`}>{segment}</span>;
  });
};

const renderAssistantContent = (content) => {
  const lines = (content || '').split('\n');

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const numberedBold = line.match(/^(\d+)\.\s+\*\*(.+)\*\*$/);
        const numbered = line.match(/^(\d+)\.\s+(.+)$/);

        if (!line.trim()) {
          return <div key={`sp_${idx}`} className="h-1" />;
        }

        if (numberedBold) {
          return (
            <div key={`nb_${idx}`} className="flex gap-2.5 rounded-xl bg-slate-50/50 px-4 py-3 border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm my-2">
              <span className="text-[#003974] font-bold">{numberedBold[1]}.</span>
              <div>{renderInlineFormatting(`**${numberedBold[2]}**`)}</div>
            </div>
          );
        }

        if (numbered) {
          return (
            <div key={`n_${idx}`} className="flex gap-2.5 pl-1.5 my-1.5">
              <span className="text-[#003974] font-bold">{numbered[1]}.</span>
              <div>{renderInlineFormatting(numbered[2])}</div>
            </div>
          );
        }

        return (
          <p key={`p_${idx}`} className="pl-1">
            {renderInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
};

const ChatbotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [showSources, setShowSources] = useState(null); // For showing sources modal
  const [serviceStatus, setServiceStatus] = useState(null);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  // Check service status on mount
  useEffect(() => {
    const checkService = async () => {
      const status = await chatbotService.healthCheck();
      if (status) {
        setServiceStatus('connected');
      } else {
        setServiceStatus('disconnected');
        setToast({
          type: 'warning',
          message: 'Chat service unavailable. Please try again later.',
        });
      }
    };
    checkService();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      // Send to RAG service
      const result = await chatbotService.sendQuestion(
        question,
        sessionId,
        user?.id
      );

      if (result.success) {
        // Add bot message with sources
        const botMessage = {
          id: `msg_${Date.now()}_bot`,
          role: 'assistant',
          content: result.answer,
          sources: result.sources || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Update session ID
        if (result.sessionId) {
          setSessionId(result.sessionId);
        }
      } else {
        // Add error message
        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'error',
          content: `Sorry, there was an error: ${result.error}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending question:', error);
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'error',
        content: 'An unexpected error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(`session_${Date.now()}_${Math.random()}`);
  };

  const suggestedQuestions = [
    'Có tour nào đi Đà Nẵng không?',
    'Tour Hà Nội mất bao nhiêu tiền?',
    'Tôi muốn đi tour 3 ngày 2 đêm',
    'Tour nào phù hợp cho gia đình?',
    'Có tour miền Tây không?',
  ];

  if (serviceStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Trợ Lý AI Đang Ngoại Tuyến</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Hệ thống trò chuyện hỗ trợ khách hàng hiện đang tạm ngắt kết nối. Vui lòng tải lại trang hoặc thử lại sau ít phút.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#003974] hover:bg-[#002f5f] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-[#003974]/20"
          >
            Tải Lại Trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans overflow-hidden">
      {/* Sidebar Panel (Desktop only) */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-[#e0e3e5] h-full flex-shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#e0e3e5] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#003974]">Trợ Lý Ảo Terra</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${serviceStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-500 font-medium">
                {serviceStatus === 'connected' ? 'Đã kết nối' : 'Mất kết nối'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Suggestions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">Gợi ý câu hỏi</p>
            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(q)}
                  className="w-full text-left bg-[#f8fafc] hover:bg-[#f1f5f9] border border-gray-100 text-[#424751] hover:text-[#003974] p-3.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Feed Panel */}
      <main className="flex-1 flex flex-col h-full bg-[#f1f5f9] relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-[#e0e3e5] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#003974]">Trợ Lý Ảo Terra</h2>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${serviceStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] text-gray-500">
                  {serviceStatus === 'connected' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Header on Desktop (Decorative) */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[#e0e3e5] shadow-sm">
          <div>
            <h1 className="text-base font-bold text-[#191c1e]">Phòng Chat Trợ Lý AI</h1>
            <p className="text-xs text-gray-500 mt-0.5">Hỏi đáp thông tin, lịch trình và báo giá tour du lịch</p>
          </div>
          <div className="text-xs font-semibold text-[#003974] bg-[#d6e3ff]/30 px-3 py-1 rounded-full border border-[#003974]/10">
            Trí Tuệ Nhân Tạo RAG
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-md mb-6 animate-bounce">
                👋
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#191c1e] mb-2">
                Xin chào, {user?.name || 'Quý khách'}!
              </h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Tôi là Trợ lý ảo AI của The Terra Tour. Tôi có thể giúp bạn tìm kiếm thông tin tour, gợi ý lịch trình phù hợp và báo giá chi tiết. Hãy nhập câu hỏi bên dưới nhé!
              </p>

              {/* Suggestions for mobile */}
              <div className="w-full md:hidden">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-left pl-1">Gợi ý câu hỏi:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className="text-left bg-white border border-[#e0e3e5] text-[#424751] hover:text-[#003974] p-3.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Bot Avatar */}
                  {msg.role !== 'user' && (
                    <div className="w-9 h-9 rounded-full bg-[#003974] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-base text-white">support_agent</span>
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl p-4 shadow-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'hero-gradient text-white rounded-tr-none'
                          : msg.role === 'error'
                          ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                          : 'bg-white text-gray-800 border border-[#e0e3e5] rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div>{renderAssistantContent(msg.content)}</div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Sources Accordion */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Nguồn tham chiếu từ {msg.sources.length} tour
                          </span>
                          <button
                            onClick={() => setShowSources(msg.id)}
                            className="inline-flex items-center gap-1 text-[10px] bg-[#003974]/5 hover:bg-[#003974]/10 text-[#003974] px-2.5 py-1 rounded-full font-bold border border-[#003974]/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">auto_stories</span>
                            Chi tiết tài liệu
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className={`text-[9px] text-gray-400 mt-1 pl-1 ${msg.role === 'user' ? 'text-right pr-1' : ''}`}>
                      {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-orange-100 border border-[#fe9400]/30 text-[#fe9400] flex items-center justify-center flex-shrink-0 shadow-md font-bold text-xs uppercase">
                      {user?.name ? user.name.slice(0, 2) : 'ME'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="max-w-3xl mx-auto flex gap-3.5 justify-start">
              <div className="w-9 h-9 rounded-full bg-[#003974] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="material-symbols-outlined text-base text-white">support_agent</span>
              </div>
              <div className="bg-white border border-[#e0e3e5] rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                <div className="flex gap-1.5 py-1.5 px-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003974]/20 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003974]/50 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003974] animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Section */}
        <div className="bg-white border-t border-[#e0e3e5] p-4 md:px-8 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-10">
          <form onSubmit={handleSendQuestion} className="max-w-3xl mx-auto relative flex items-center bg-gray-50 border border-[#e0e3e5] rounded-2xl focus-within:border-[#003974] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003974]/10 transition-all">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hỏi tôi về lịch trình, điểm đến, báo giá..."
              disabled={loading}
              className="w-full py-4 pl-5 pr-14 bg-transparent border-0 outline-none focus:ring-0 text-sm text-[#191c1e] placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2.5 p-2 bg-[#003974] hover:bg-[#002f5f] disabled:bg-gray-300 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-white text-base">send</span>
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            Trợ lý Terra AI có thể sai sót. Vui lòng xác nhận các thông tin quan trọng.
          </p>
        </div>
      </main>

      {/* Sources Modal */}
      {showSources && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[75vh] flex flex-col overflow-hidden border border-gray-100">
            <div className="sticky top-0 bg-white border-b border-[#e0e3e5] p-5 flex justify-between items-center">
              <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#003974]">auto_stories</span>
                Tài Liệu & Nguồn Tham Chiếu
              </h3>
              <button
                onClick={() => setShowSources(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl font-light hover:rotate-90 transition-transform p-1"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 [scrollbar-width:thin]">
              {messages
                .find((m) => m.id === showSources)
                ?.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-[#003974]/5 to-transparent rounded-2xl border border-[#e0e3e5] shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#003974] text-sm">{source.tour_name}</h4>
                      <span className="text-[10px] font-bold text-[#fe9400] bg-[#fe9400]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#fe9400]/20">
                        ⭐ {(source.score * 100).toFixed(0)}% Khớp
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-gray-100 italic">
                      "{source.chunk_text}"
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#424751] pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#003974]">category</span>
                        {source.category}
                      </span>
                      <span className="flex items-center gap-1 text-[#003974]">
                        <span className="material-symbols-outlined text-sm text-[#fe9400]">payments</span>
                        Giá từ: {source.price.toLocaleString()} {source.currency}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-[#e0e3e5] flex justify-end">
              <button
                onClick={() => setShowSources(null)}
                className="px-5 py-2 bg-white border border-[#e0e3e5] hover:bg-gray-100 rounded-xl text-xs font-semibold text-[#424751] transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ChatbotPage;
