import { createContext, useState, useEffect } from 'react';

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timerId = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timerId);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const icon = toast?.type === 'success' ? '✓' : '✕';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">{icon}</span>
          <p className="toast-message">{toast.message}</p>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export { ToastContext, ToastProvider };