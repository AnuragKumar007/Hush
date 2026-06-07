import React, { useState } from 'react';
import { MessageSquare, ArrowRight, ShieldCheck, Zap, Sparkles, ShieldAlert } from 'lucide-react';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function LandingPage({ onCreateRoom, onJoinRoom }) {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.roomId) {
        onCreateRoom(data.roomId);
      } else {
        setError('Server returned an error. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const input = roomIdInput.trim();
    if (!input) return;

    try {
      const url = new URL(input);
      if (url.pathname.includes('/room/')) {
        const id = url.pathname.split('/room/')[1];
        if (id) {
          onJoinRoom(id.toLowerCase());
          return;
        }
      }
    } catch(err) {}

    const cleanId = input.toLowerCase();
    if (cleanId.length < 3) {
      setError('Room ID is too short.');
      return;
    }
    
    onJoinRoom(cleanId);
  };

  return (
    <div className="w-full h-full min-h-screen bg-brand-dark flex flex-col justify-between px-6 py-8 relative overflow-hidden select-none">
      {/* Background ambient glow blobs */}
      <div className="glow-spot top-10 left-10"></div>
      <div className="glow-spot-cyan bottom-10 right-10"></div>

      {/* Header Logo */}
      <header className="relative z-10 flex items-center gap-2 justify-center">
        <div className="w-9 h-9 bg-gradient-to-tr from-brand-neon to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-neon/15">
          <MessageSquare className="text-white" size={18} />
        </div>
        <span className="text-lg font-black tracking-widest text-white uppercase">Hush</span>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 my-auto flex flex-col items-center text-center max-w-sm mx-auto w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-brand-border text-xs text-zinc-400 mb-6">
          <Sparkles size={12} className="text-brand-accent" />
          <span>100% Anonymous & Ephemeral</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Ephemeral chat for <br />
          <span className="bg-gradient-to-r from-brand-neon to-brand-accent bg-clip-text text-transparent">
            private discussions
          </span>
        </h1>

        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
          No signups. No phone numbers. No database records. Create a room, share the link, and chat in real-time. When you leave, your chat history is permanently wiped.
        </p>

        {/* Display connection/creation errors */}
        {error && (
          <div className="w-full bg-rose-950/40 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300 mb-5 animate-shake">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-neon to-brand-accent hover:opacity-95 disabled:opacity-50 text-white py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-neon/15 active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Create Instant Room
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="h-[1px] bg-brand-border flex-1"></div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">or join existing</span>
            <div className="h-[1px] bg-brand-border flex-1"></div>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              required
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              placeholder="Enter Room ID (e.g. abc-def-ghi)"
              className="flex-1 bg-zinc-950/80 border border-brand-border rounded-xl py-3 px-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-brand-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!roomIdInput.trim()}
              className="bg-zinc-900 border border-brand-border text-zinc-300 hover:text-white px-4 rounded-xl text-xs font-semibold hover:bg-zinc-800 active:scale-[0.97] transition-all"
            >
              Join
            </button>
          </form>
        </div>
      </main>

      {/* Feature Cards Footer */}
      <footer className="relative z-10 max-w-sm mx-auto w-full grid grid-cols-2 gap-x-3 gap-y-4 pt-6 border-t border-brand-border/40 animate-fade-in">
        <div className="flex gap-2.5 items-start">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-brand-border text-brand-neon mt-0.5">
            <ShieldCheck size={14} />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-zinc-300">Absolute Privacy</h4>
            <p className="text-[10px] text-zinc-500 leading-tight">No tracking, cookies, or chat logging.</p>
          </div>
        </div>

        <div className="flex gap-2.5 items-start">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-brand-border text-brand-accent mt-0.5">
            <Zap size={14} />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-zinc-300">Instantly Active</h4>
            <p className="text-[10px] text-zinc-500 leading-tight">No email verification, join instantly.</p>
          </div>
        </div>

        {/* Panic Switch Info Card */}
        <div className="col-span-2 flex gap-2.5 items-start bg-rose-950/10 border border-rose-500/10 rounded-2xl p-3">
          <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
            <ShieldAlert size={14} />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-rose-300">Panic Kill Switch</h4>
            <p className="text-[10px] text-rose-400/80 leading-normal">Tap the red shield icon in a chat room to instantly clear all session memory and redirect to Wikipedia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
