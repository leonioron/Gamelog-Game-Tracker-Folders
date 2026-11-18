import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-[110] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-medium transition-all ${
              isError
                ? 'bg-[#1a1116]/95 border-rose-500/40 text-rose-200'
                : isInfo
                ? 'bg-[#121824]/95 border-indigo-500/40 text-indigo-200'
                : 'bg-[#0f1d18]/95 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : isInfo ? (
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}

            <span className="flex-1 min-w-0 leading-snug break-words">{toast.message}</span>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="min-h-[44px] min-w-[44px] -my-2 -mr-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg shrink-0 cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
