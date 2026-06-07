import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import MessageBubble from './MessageBubble';
import SystemNotification from './SystemNotification';
import Toast from './Toast';
import { 
  Send, 
  Users, 
  LogOut, 
  Copy, 
  Check, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  ClipboardCopy,
  ShieldAlert,
  Lock,
  Settings,
  X,
  Image as ImageIcon
} from 'lucide-react';
import Camouflage from './Camouflage';
import { WebRTCManager } from '../utils/webrtc';

export default function ChatRoom({ roomId, username, onLeave }) {
  const [feed, setFeed] = useState([]); // Array of message or notification objects
  const [users, setUsers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [p2pStatus, setP2pStatus] = useState('disconnected');
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Stealth Mode State
  const [stealthMode, setStealthMode] = useState(() => sessionStorage.getItem('stealthMode') !== 'false');
  const [isLocked, setIsLocked] = useState(() => sessionStorage.getItem('stealthMode') !== 'false');
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const webrtcRef = useRef(null);

  // Trigger custom toast alert
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Ref to track first connection to suppress toast spam
  const isInitialConnect = useRef(true);

  useEffect(() => {
    let activeKey = null;
    let isMounted = true;

    const initConnection = async () => {
      if (!socket.connected) {
        socket.connect();
      } else {
        socket.emit('join-room', { roomId, username });
      }
      setIsConnected(socket.connected);

      const processMsg = async (msg) => msg;

      const handleP2PMessage = async (dataStr) => {
        try {
          const parsedData = JSON.parse(dataStr);
          const msgObj = {
            id: parsedData.id,
            sender: parsedData.sender,
            text: JSON.stringify(parsedData.payload),
            timestamp: parsedData.timestamp
          };
          const processed = await processMsg(msgObj);
          if (isMounted) {
            setFeed(prev => [...prev, { type: 'message', id: processed.id, sender: processed.sender, text: processed.text, timestamp: processed.timestamp }]);
          }
        } catch(e) {
          console.error("Failed to parse P2P message", e);
        }
      };

      if (!webrtcRef.current) {
        webrtcRef.current = new WebRTCManager(socket, handleP2PMessage, (status) => {
          if (isMounted) setP2pStatus(status);
        });
      }

      const onConnect = () => {
        setIsConnected(true);
        if (isInitialConnect.current) {
          isInitialConnect.current = false;
        } else {
          showToast('Reconnected to server', 'success');
        }
        socket.emit('join-room', { roomId, username });
      };

      const onDisconnect = () => {
        setIsConnected(false);
        showToast('Disconnected from server', 'error');
      };

      const onRoomJoined = async ({ roomId: joinedRoomId, users: initialUsers, messages: initialMessages }) => {
        setUsers(initialUsers);
        
        const historyFeed = await Promise.all(initialMessages.map(async msg => {
          const processed = await processMsg(msg);
          return { type: 'message', id: processed.id, sender: processed.sender, text: processed.text, timestamp: processed.timestamp };
        }));

        const systemWelcome = {
          type: 'notification',
          id: 'system-welcome',
          eventType: 'info',
          text: `You joined room: ${joinedRoomId} as ${username}`,
          timestamp: new Date().toISOString()
        };

        if (isMounted) setFeed([...historyFeed, systemWelcome]);
      };

      const onUserJoined = ({ username: joinedUser, users: updatedUsers }) => {
        setUsers(updatedUsers);
        setFeed(prev => [...prev, { type: 'notification', id: `join-${Date.now()}-${Math.random()}`, eventType: 'join', text: `${joinedUser} joined the chat`, timestamp: new Date().toISOString() }]);
        
        // Initiate WebRTC connection when someone joins our room
        if (updatedUsers.length === 2 && webrtcRef.current) {
          const otherUser = updatedUsers.find(u => u.username !== username);
          if (otherUser) {
            webrtcRef.current.initiateConnection(otherUser.socketId);
          }
        }
      };

      const onUserLeft = ({ username: leftUser, users: updatedUsers }) => {
        setUsers(updatedUsers);
        setFeed(prev => [...prev, { type: 'notification', id: `leave-${Date.now()}-${Math.random()}`, eventType: 'leave', text: `${leftUser} left the chat`, timestamp: new Date().toISOString() }]);
      };

      const onMessage = async (message) => {
        const processed = await processMsg(message);
        if (isMounted) {
          setFeed(prev => [...prev, { type: 'message', id: processed.id, sender: processed.sender, text: processed.text, timestamp: processed.timestamp }]);
        }
      };

      const onError = (errorMessage) => showToast(errorMessage, 'error');

      const onRoomBurned = ({ message }) => {
        showToast(message || 'Room destroyed due to inactivity.', 'error');
        setTimeout(() => { socket.disconnect(); onLeave(); }, 3000);
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('room-joined', onRoomJoined);
      socket.on('user-joined', onUserJoined);
      socket.on('user-left', onUserLeft);
      socket.on('message', onMessage);
      socket.on('error', onError);
      socket.on('room-burned', onRoomBurned);
    };

    initConnection();

    if (inputRef.current) inputRef.current.focus();

    return () => {
      isMounted = false;
      if (webrtcRef.current) {
        webrtcRef.current.cleanup();
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('message');
      socket.off('error');
      socket.off('room-burned');
    };
  }, [roomId, username]);

  // Scroll to bottom whenever feed changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText) return;

    try {
      const payload = { type: 'text', content: cleanText };
      
      const msgObj = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        sender: username,
        payload: payload,
        timestamp: new Date().toISOString()
      };

      if (p2pStatus === 'connected' && webrtcRef.current) {
        webrtcRef.current.sendMessage(JSON.stringify(msgObj));
        setFeed(prev => [...prev, { type: 'message', id: msgObj.id, sender: msgObj.sender, text: JSON.stringify(payload), timestamp: msgObj.timestamp }]);
      } else {
        socket.emit('send-message', { roomId, text: JSON.stringify(payload) });
      }

      setInputText('');
      inputRef.current?.focus();
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataURL = ev.target.result;
      try {
        const payload = { type: 'image', data: dataURL };
        
        const msgObj = {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          sender: username,
          payload: payload,
          timestamp: new Date().toISOString()
        };

        if (p2pStatus === 'connected' && webrtcRef.current) {
          webrtcRef.current.sendMessage(JSON.stringify(msgObj));
          setFeed(prev => [...prev, { type: 'message', id: msgObj.id, sender: msgObj.sender, text: JSON.stringify(payload), timestamp: msgObj.timestamp }]);
        } else {
          socket.emit('send-message', { roomId, text: JSON.stringify(payload) });
        }
      } catch (err) {
        showToast('Failed to send image', 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiedLink(true);
        showToast('Shareable link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {
        showToast('Failed to copy link', 'error');
      });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopiedId(true);
        showToast('Room ID copied!');
        setTimeout(() => setCopiedId(false), 2000);
      })
      .catch(() => {
        showToast('Failed to copy ID', 'error');
      });
  };

  const handleLeave = () => {
    socket.emit('leave-room', { roomId });
    socket.disconnect();
    onLeave();
  };

  const handlePanic = () => {
    socket.emit('leave-room', { roomId });
    socket.disconnect();
    onLeave();
    window.location.replace('https://en.wikipedia.org/wiki/Main_Page');
  };

  const handleSaveSettings = (newStealth) => {
    setStealthMode(newStealth);
    sessionStorage.setItem('stealthMode', newStealth);
    setShowSettings(false);
    showToast('Settings saved successfully');
  };

  if (isLocked && stealthMode) {
    return <Camouflage onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-brand-dark overflow-hidden relative">
      {/* Top Header */}
      <header className="h-16 border-b border-brand-border bg-brand-card/90 backdrop-blur-md px-4 flex items-center justify-between z-10 flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Leave Button */}
          <button 
            onClick={handleLeave}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-rose-400 active:bg-zinc-800/40 transition-colors"
            title="Leave room"
          >
            <LogOut size={20} />
          </button>

          {/* Room Title */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-widest">HUSH ROOM</span>
              {isConnected ? (
                <Wifi size={12} className={p2pStatus === 'connected' ? "text-cyan-400" : "text-emerald-500"} title={p2pStatus === 'connected' ? "P2P Connected" : "Server Connected"} />
              ) : (
                <WifiOff size={12} className="text-rose-500 animate-pulse" />
              )}
            </div>
            {/* Clickable Room ID to copy */}
            <button 
              onClick={handleCopyId}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-brand-accent transition-colors font-mono font-medium active:scale-95"
            >
              ID: {roomId}
              {copiedId ? <Check size={10} className="text-brand-accent" /> : <Copy size={10} />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
            title="Room Settings"
          >
            <Settings size={20} />
          </button>

          {/* Lock Button (if stealth enabled) */}
          {stealthMode && (
            <button
              onClick={() => setIsLocked(true)}
              className="p-2 rounded-xl text-amber-500 hover:text-amber-400 bg-amber-500/10 border border-amber-500/20 active:scale-95 transition-all"
              title="Lock Chat"
            >
              <Lock size={20} />
            </button>
          )}

          {/* Quick Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-brand-accent bg-brand-accent/5 border border-brand-accent/20 hover:bg-brand-accent/10 active:scale-95 transition-all"
          >
            <ClipboardCopy size={12} />
            <span>Link</span>
          </button>

        </div>
      </header>

      {/* Main Messaging Panel */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth">
        {feed.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center mb-3 animate-pulse">
              <Users size={20} className="text-zinc-600" />
            </div>
            <p className="text-xs">Waiting for others to join...</p>
            <p className="text-[10px] mt-1 text-zinc-600">Share your room link above to invite someone.</p>
          </div>
        )}

        {feed.map((item) => {
          if (item.type === 'message') {
            return (
              <MessageBubble 
                key={item.id} 
                message={item} 
                isMe={item.sender === username} 
              />
            );
          } else {
            return (
              <SystemNotification 
                key={item.id} 
                notification={item} 
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Bottom Message Input Form */}
      <footer className="p-3 border-t border-brand-border bg-brand-card/90 backdrop-blur-md flex-shrink-0 z-10">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-lg mx-auto items-center">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
            className="p-3 text-zinc-400 hover:text-white bg-zinc-950/80 border border-brand-border rounded-2xl transition-colors active:scale-95 disabled:opacity-40"
            title="Send Ephemeral Image"
          >
            <ImageIcon size={20} />
          </button>
          
          <div className="flex-1 relative flex items-center bg-zinc-950/80 border border-brand-border rounded-2xl focus-within:border-brand-accent transition-colors">
            <input
              ref={inputRef}
              type="text"
              maxLength={1000}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={"Type message..."}
              disabled={!isConnected}
              className="w-full bg-transparent border-0 py-3.5 pl-4 pr-14 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
            {inputText.length > 800 && (
              <span className="absolute right-4 text-[9px] font-bold text-zinc-600">
                {1000 - inputText.length}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="w-11 h-11 bg-gradient-to-r from-brand-neon to-brand-accent hover:opacity-95 disabled:opacity-40 disabled:from-zinc-800 disabled:to-zinc-800 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-brand-neon/10"
          >
            <Send size={16} />
          </button>
        </form>
      </footer>

      {/* Sliding Users Drawer (Mobile Slide-in Panel) */}
      {isUsersOpen && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in" onClick={() => setIsUsersOpen(false)}>
          <div 
            className="w-72 h-full bg-brand-card border-l border-brand-border flex flex-col justify-between shadow-2xl animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="h-16 px-5 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-brand-accent" />
                  <span className="text-sm font-bold text-zinc-200">Active Users</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    {users.length}
                  </span>
                </div>
                <button 
                  onClick={() => setIsUsersOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* User List */}
              <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)]">
                {users.map((user) => {
                  const isCurrent = user.username === username;
                  return (
                    <div 
                      key={user.socketId}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isCurrent 
                          ? 'bg-brand-accent/5 border-brand-accent/20 text-white' 
                          : 'bg-zinc-950/40 border-brand-border text-zinc-300'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-brand-accent' : 'bg-zinc-600'} animate-pulse`} />
                      <span className="text-xs font-medium truncate flex-1">
                        {user.username} {isCurrent && <span className="text-[9px] text-brand-accent font-bold ml-1">(You)</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-brand-border bg-zinc-950/20 space-y-2 select-none">
              <button
                onClick={handleCopyLink}
                className="w-full bg-zinc-900 border border-brand-border hover:bg-zinc-800 text-zinc-300 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ClipboardCopy size={14} />
                Copy Room Link
              </button>
              <button
                onClick={handleLeave}
                className="w-full bg-rose-950/40 border border-rose-500/20 text-rose-300 hover:bg-rose-950/60 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <LogOut size={14} />
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-brand-card w-full max-w-sm rounded-2xl border border-brand-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-brand-accent" />
                Room Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-brand-border">
                <div>
                  <h3 className="font-medium text-white text-sm">Stealth Mode</h3>
                  <p className="text-xs text-zinc-400 mt-1">Disguise chat as a Recipe app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={stealthMode}
                    onChange={(e) => setStealthMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                </label>
              </div>

              {stealthMode && (
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-brand-border space-y-2">
                  <h3 className="font-medium text-white text-sm">How to Unlock</h3>
                  <p className="text-[12px] text-zinc-400">When the chat is locked, you will see a recipe page. Tap <strong className="text-brand-accent">any recipe image 3 times</strong> consecutively to unlock the chat.</p>
                </div>
              )}

              <button
                onClick={() => handleSaveSettings(stealthMode)}
                className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
