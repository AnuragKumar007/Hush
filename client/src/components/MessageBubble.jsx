import React from 'react';

export default function MessageBubble({ message, isMe, onImageClick }) {
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
          {type === 'image' && (
            <img 
              src={content} 
              alt="shared" 
              className="max-w-[200px] rounded-xl cursor-zoom-in hover:brightness-95 active:scale-[0.98] transition-all"
              onClick={() => onImageClick && onImageClick(content)}
            />
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
