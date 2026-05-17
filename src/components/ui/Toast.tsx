import { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-sm animate-slide-in ${
              t.type === 'success'
                ? 'bg-[#2D7A4F]'
                : t.type === 'error'
                  ? 'bg-[#C0392B]'
                  : 'bg-[#1A1A1A]'
            }`}
          >
            {t.type === 'success' && <span>✓</span>}
            {t.type === 'error' && <span>✕</span>}
            {t.type === 'info' && <span>ℹ</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
