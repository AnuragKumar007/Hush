import React from 'react';
import { UserPlus, UserMinus, Info } from 'lucide-react';

export default function SystemNotification({ notification }) {
  const { type, text, timestamp } = notification;

  const Icon = {
    join: UserPlus,
    leave: UserMinus,
    info: Info,
  }[type] || Info;

  const colorClass = {
    join: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10',
    leave: 'text-rose-500 bg-rose-500/5 border-rose-500/10',
    info: 'text-cyan-500 bg-cyan-500/5 border-cyan-500/10',
  }[type] || 'text-zinc-500 bg-zinc-500/5 border-zinc-500/10';

  return (
    <div className="flex justify-center my-3 animate-fade-in">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium ${colorClass}`}>
        <Icon size={12} className="opacity-90" />
        <span>{text}</span>
      </div>
    </div>
  );
}
