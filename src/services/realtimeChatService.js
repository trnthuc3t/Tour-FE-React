const getWsUrl = () => {
  const customUrl = import.meta.env.VITE_CHAT_WS_URL;
  
  if (customUrl) {
    return customUrl;
  }
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `ws://localhost:8000/ws/chat`;
  }
  
  return `/ws/chat`;
};

const DEFAULT_WS_URL = getWsUrl();

export function createRealtimeChatSocket({ onOpen, onMessage, onError, onClose } = {}) {
  const socket = new WebSocket(DEFAULT_WS_URL);

  socket.addEventListener('open', () => {
    if (onOpen) onOpen(socket);
  });

  socket.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (onMessage) onMessage(payload, socket);
    } catch (_) {
      if (onError) onError(new Error('Invalid WS payload'));
    }
  });

  socket.addEventListener('error', () => {
    if (onError) onError(new Error('WebSocket connection error'));
  });

  socket.addEventListener('close', () => {
    if (onClose) onClose();
  });

  return socket;
}

export default {
  createRealtimeChatSocket,
};
