import React, { useState, useEffect } from 'react';
import { generateAnonymousName } from '../utils/nameGenerator';
import { Shuffle, ArrowRight, Shield } from 'lucide-react';

export default function UsernameModal({ onSubmit }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Seed an initial random name
    setUsername(generateAnonymousName());
  }, []);

  const handleShuffle = () => {
    setUsername(generateAnonymousName());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = username.trim();
    if (cleanName) {
      onSubmit(cleanName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-brand-card/90 border border-brand-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="glow-spot -top-12 -right-12"></div>
        <div className="glow-spot-cyan -bottom-16 -left-16"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo/Icon */}
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-neon to-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-neon/20 mb-4 animate-pulse-subtle">
            <Shield className="text-white" size={28} />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Incognito Entry
          </h2>
          <p className="text-xs text-zinc-400 mb-6">
            Choose a temporary identity. No registration or logs.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={20}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter display name"
                className="w-full bg-zinc-950/80 border border-brand-border rounded-xl py-3.5 px-4 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-accent transition-colors text-center font-medium"
              />
              <button
                type="button"
                onClick={handleShuffle}
                className="absolute right-2.5 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-brand-accent transition-colors"
                title="Generate random name"
              >
                <Shuffle size={16} />
              </button>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-brand-neon to-brand-accent hover:opacity-95 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/10 active:scale-[0.98]"
            >
              Join Secure Chat
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
