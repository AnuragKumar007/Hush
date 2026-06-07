import React, { useState } from 'react';
import { Eye, Image as ImageIcon } from 'lucide-react';

export default function MessageBubble({ message, isMe }) {
  const { sender, text, timestamp } = message;
  
  let type = 'text';
  let content = text;
  
  try {
    const parsed = JSON.parse(text);
    if (parsed.type) {
      type = parsed.type;
      content = parsed.content || parsed.data;
    }
  } catch(e) {
    // fallback to text
  }

  const [viewState, setViewState] = useState(type === 'image' ? 'hidden' : 'visible'); // hidden, viewing, burned

  const handleViewImage = () => {
    if (viewState !== 'hidden') return;
    setViewState('viewing');
    setTimeout(() => {
      setViewState('burned');
    }, 5000);
  };
  
  // Format timestamp (e.g., 14:32)
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '';
    }
  };

  // Generate a consistent single-letter avatar from sender's name
  const getAvatarChar = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className={`flex w-full items-end gap-2 my-2.5 animate-slide-up ${isMe ? 'justify-end' : 'justify-start'}`}>
      {/* Sender Avatar (Only for other users) */}
      {!isMe && (
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 select-none flex-shrink-0">
          {getAvatarChar(sender)}
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Username for other users */}
        {!isMe && (
          <span className="text-[10px] font-medium text-zinc-500 mb-0.5 ml-1">
            {sender}
          </span>
        )}

        {/* Message body */}
        <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words whitespace-pre-wrap leading-relaxed ${
          isMe 
            ? 'bg-gradient-to-r from-brand-neon to-brand-accent text-white rounded-br-sm' 
            : 'bg-brand-card border border-brand-border text-zinc-200 rounded-bl-sm'
        }`}>
          {type === 'text' && content}
          {type === 'image' && viewState === 'hidden' && (
            <button onClick={handleViewImage} className="flex flex-col items-center justify-center p-4 bg-black/20 hover:bg-black/30 rounded-xl cursor-pointer active:scale-95 transition-all w-[150px]">
              <Eye size={24} className="mb-2" />
              <span className="text-xs font-bold">Tap to View (5s)</span>
            </button>
          )}
          {type === 'image' && viewState === 'viewing' && (
             <img src={content} alt="ephemeral" className="max-w-[200px] rounded-xl animate-fade-in" />
          )}
          {type === 'image' && viewState === 'burned' && (
             <div className="flex flex-col items-center justify-center p-4 text-zinc-500/50 w-[150px]">
               <ImageIcon size={24} className="mb-2 opacity-50" />
               <span className="text-[10px] italic font-semibold">Burned</span>
             </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] text-zinc-600 mt-1 px-1">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
