import { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />)}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const typeStyles = {
    success: 'bg-[#00509d] text-white',
    error: 'bg-[#ba1a1a] text-white',
    warning: 'bg-[#fe9400] text-white',
    info: 'bg-[#00404f] text-white',
  };
  const typeIcons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${typeStyles[toast.type]} animate-slide-in`}>
      <span className="material-symbols-outlined">{typeIcons[toast.type]}</span>
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><span className="material-symbols-outlined text-lg">close</span></button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export default ToastProvider;
