const crypto = require('crypto');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // Map<roomId, { id, users: Map<socketId, username>, messages: [], burnTimer: null }>
    this.io = null;
    this.BURN_TIME = 15 * 60 * 1000; // 15 minutes
  }

  setIo(io) {
    this.io = io;
  }

  // Generate a random, readable room ID like: xxx-xxx-xxx
  generateRoomId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = () => {
      let str = '';
      for (let i = 0; i < 3; i++) {
        const index = crypto.randomInt(0, chars.length);
        str += chars[index];
      }
      return str;
    };
    
    let roomId;
    let attempts = 0;
    do {
      roomId = `${segment()}-${segment()}-${segment()}`;
      attempts++;
    } while (this.rooms.has(roomId) && attempts < 100);
    
    return roomId;
  }

  createRoom() {
    const roomId = this.generateRoomId();
    this.rooms.set(roomId, {
      id: roomId,
      users: new Map(), // socketId -> username
      messages: []
    });
    return roomId;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  resetBurnTimer(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.burnTimer) {
      clearTimeout(room.burnTimer);
    }

    room.burnTimer = setTimeout(() => {
      if (this.io) {
        this.io.to(roomId).emit('room-burned', { message: 'Room destroyed due to inactivity.' });
      }
      this.rooms.delete(roomId);
      console.log(`Room [${roomId}] burned due to 15m inactivity.`);
    }, this.BURN_TIME);
  }

  addUser(roomId, socketId, username) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        messages: []
      });
    }
    const room = this.rooms.get(roomId);
    room.users.set(socketId, username);
    this.resetBurnTimer(roomId);
    return this.getUsersList(roomId);
  }

  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return { username: null, isEmpty: true };

    const username = room.users.get(socketId);
    room.users.delete(socketId);

    const isEmpty = room.users.size === 0;
    if (isEmpty) {
      if (room.burnTimer) clearTimeout(room.burnTimer);
      this.rooms.delete(roomId); // Auto-cleanup room if empty
    }

    return { username, isEmpty };
  }

  getUsersList(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    const users = [];
    room.users.forEach((username, socketId) => {
      users.push({ socketId, username });
    });
    return users;
  }

  addMessage(roomId, sender, text) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message = {
      id: crypto.randomUUID(),
      sender,
      text,
      timestamp: new Date().toISOString()
    };

    room.messages.push(message);
    
    // Cap room history at 100 messages to prevent excessive memory consumption
    if (room.messages.length > 100) {
      room.messages.shift();
    }

    this.resetBurnTimer(roomId);

    return message;
  }

  getMessages(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.messages : [];
  }
}

module.exports = new RoomManager();
