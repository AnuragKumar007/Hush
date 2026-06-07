import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = {
    success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500/30 text-rose-200',
    info: 'bg-zinc-900/90 border-brand-accent/30 text-cyan-200',
  }[type];

  return (
    <div className={`fixed bottom-24 left-4 right-4 mx-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up max-w-sm ${bgClass}`}>
      <span className="text-sm font-medium flex-1 text-center">{message}</span>
      <button 
        onClick={onClose} 
        className="p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
