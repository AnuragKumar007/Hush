import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatRoom from './components/ChatRoom';
import UsernameModal from './components/UsernameModal';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [username, setUsername] = useState('');

  // Handle URL change listening (for back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Router logic: detect if we are on a room page
  // Path format: /room/xxx-xxx-xxx or similar
  const roomPathMatch = currentPath.match(/^\/room\/([^/]+)$/);
  const roomId = roomPathMatch ? roomPathMatch[1] : null;

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(window.location.pathname); // Pathname does not include hash
  };

  const handleCreateRoom = (newRoomId) => {
    navigateTo(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (targetRoomId) => {
    navigateTo(`/room/${targetRoomId}`);
  };

  const handleLeaveRoom = () => {
    setUsername('');
    navigateTo('/');
  };

  const handleUsernameSubmit = (name) => {
    setUsername(name);
  };

  return (
    <div className="w-full h-full max-w-md mx-auto md:border-x md:border-brand-border md:shadow-2xl bg-brand-dark flex flex-col relative select-none">
      {/* If we have a roomId, load username prompt first, then chatroom */}
      {roomId ? (
        !username ? (
          <UsernameModal onSubmit={handleUsernameSubmit} />
        ) : (
          <ChatRoom 
            roomId={roomId} 
            username={username} 
            onLeave={handleLeaveRoom} 
          />
        )
      ) : (
        <LandingPage 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      )}
    </div>
  );
}
