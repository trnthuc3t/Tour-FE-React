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
    <div className="space-y-2 text-sm leading-6 text-slate-700">
      {lines.map((line, idx) => {
        const numberedBold = line.match(/^(\d+)\.\s+\*\*(.+)\*\*$/);
        const numbered = line.match(/^(\d+)\.\s+(.+)$/);

        if (!line.trim()) {
          return <div key={`sp_${idx}`} className="h-1" />;
        }

        if (numberedBold) {
          return (
            <div key={`nb_${idx}`} className="flex gap-2 rounded-md bg-slate-50 px-3 py-2 border border-slate-200">
              <span className="text-indigo-600 font-semibold">{numberedBold[1]}.</span>
              <div>{renderInlineFormatting(`**${numberedBold[2]}**`)}</div>
            </div>
          );
        }

        if (numbered) {
          return (
            <div key={`n_${idx}`} className="flex gap-2">
              <span className="text-indigo-600 font-semibold">{numbered[1]}.</span>
              <div>{renderInlineFormatting(numbered[2])}</div>
            </div>
          );
        }

        return (
          <p key={`p_${idx}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Unavailable</h2>
          <p className="text-gray-600 mb-6">
            The chatbot service is currently unavailable. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🤖 Tour Chatbot
            </h1>
            <p className="text-sm text-gray-600">Hỏi đáp về tour du lịch</p>
          </div>
          <button
            onClick={handleClearChat}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-4xl mx-auto p-4 flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow-lg p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Tour Chatbot!</h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Ask me anything about our tour packages. I'll help you find the perfect tour!
              </p>

              {/* Suggested Questions */}
              <div className="w-full">
                <p className="text-gray-700 font-semibold mb-3">Suggested questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-gray-700 p-3 rounded-lg text-sm transition border border-indigo-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : msg.role === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-300 rounded-bl-none'
                      : 'bg-white text-gray-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div>{renderAssistantContent(msg.content)}</div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <button
                        onClick={() => setShowSources(msg.id)}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md hover:bg-indigo-700 transition"
                      >
                        📚 {msg.sources.length} Sources
                      </button>
                    </div>
                  )}

                  <span className="text-xs opacity-70 mt-2 block">
                    {msg.timestamp.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3 rounded-bl-none">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập câu hỏi về tour..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Sources Modal */}
      {showSources && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">📚 Sources</h3>
              <button
                onClick={() => setShowSources(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              {messages
                .find((m) => m.id === showSources)
                ?.sources.map((source, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200"
                  >
                    <h4 className="font-bold text-indigo-900 mb-2">{source.tour_name}</h4>
                    <p className="text-sm text-gray-700 mb-2">{source.chunk_text}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>
                        📍 {source.category}
                      </span>
                      <span>
                        💰 {source.price.toLocaleString()} {source.currency}
                      </span>
                      <span>
                        ⭐ {(source.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
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
