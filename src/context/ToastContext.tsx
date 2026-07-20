import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastOptions {
  message: string;
  type?: 'success' | 'error';
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions & { id: number } | null>(null);

  const showToast = ({ message, type = 'success', duration = 3000 }: ToastOptions) => {
    const id = Date.now();
    setToast({ message, type, duration, id });
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-white dark:bg-slate-800 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium text-sm pr-2 text-slate-700 dark:text-slate-200">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
