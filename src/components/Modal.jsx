import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true, footer }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {(title || showClose) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-[#e0e3e5]">
            {title && <h2 className="text-xl font-bold text-[#191c1e]">{title}</h2>}
            {showClose && (
              <button onClick={onClose} className="p-2 text-[#424751] hover:text-[#191c1e] hover:bg-[#f2f4f6] rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        {footer && <div className="p-4 md:p-6 border-t border-[#e0e3e5] bg-[#f2f4f6]">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
