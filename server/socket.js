const roomManager = require('./roomManager');

module.exports = function (io) {
  roomManager.setIo(io);
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room with username
    socket.on('join-room', ({ roomId, username }) => {
      if (!roomId || !username) {
        return socket.emit('error', 'Room ID and Username are required.');
      }

      // Format inputs
      const formattedRoomId = roomId.trim().toLowerCase();
      const formattedUsername = username.trim();

      // Check if user already exists under this socket ID in the room before adding
      const room = roomManager.getRoom(formattedRoomId);
      const isAlreadyInRoom = room && room.users.get(socket.id) === formattedUsername;
      
      // Enforce 2-person limit
      if (room && !isAlreadyInRoom && room.users.size >= 2) {
        return socket.emit('error', 'Room is full. Maximum 2 users allowed.');
      }

      // Set properties on socket object for easy cleanup
      socket.roomId = formattedRoomId;
      socket.username = formattedUsername;

      // Join socket.io channel
      socket.join(formattedRoomId);

      // Add user to local in-memory room state
      const usersList = roomManager.addUser(formattedRoomId, socket.id, formattedUsername);
      const messages = roomManager.getMessages(formattedRoomId);

      // Acknowledge join to the sender
      socket.emit('room-joined', {
        roomId: formattedRoomId,
        users: usersList,
        messages: messages
      });

      // Only broadcast join notification to others in the room if the user was not already in the room
      if (!isAlreadyInRoom) {
        socket.to(formattedRoomId).emit('user-joined', {
          username: formattedUsername,
          users: usersList
        });
        console.log(`User [${formattedUsername}] joined room [${formattedRoomId}]`);
      }
    });

    // WebRTC Signaling
    socket.on('webrtc-offer', ({ offer, to }) => {
      socket.to(to).emit('webrtc-offer', { offer, from: socket.id });
    });

    socket.on('webrtc-answer', ({ answer, to }) => {
      socket.to(to).emit('webrtc-answer', { answer, from: socket.id });
    });

    socket.on('webrtc-ice-candidate', ({ candidate, to }) => {
      socket.to(to).emit('webrtc-ice-candidate', { candidate, from: socket.id });
    });

    // Handle sending message
    socket.on('send-message', ({ roomId, text }) => {
      const formattedRoomId = roomId ? roomId.trim().toLowerCase() : socket.roomId;
      const username = socket.username || 'Anonymous';

      if (!formattedRoomId) {
        return socket.emit('error', 'You are not in a room.');
      }

      if (!text || text.trim() === '') {
        return; // ignore empty messages
      }

      // Safe length check (~7.5MB characters to support larger/fallback base64 images)
      if (text.length > 7500000) {
        return socket.emit('error', 'Payload too large. Maximum 5MB allowed.');
      }
      
      const cleanText = text;

      // Store message in room history
      const messageObj = roomManager.addMessage(formattedRoomId, username, cleanText);

      if (messageObj) {
        // Send message to everyone in the room (including sender)
        io.to(formattedRoomId).emit('message', messageObj);
      }
    });

    // Explicit leave room command
    socket.on('leave-room', ({ roomId }) => {
      const formattedRoomId = roomId ? roomId.trim().toLowerCase() : socket.roomId;
      const username = socket.username;

      if (formattedRoomId) {
        socket.leave(formattedRoomId);
        const { username: removedUsername, isEmpty } = roomManager.removeUser(formattedRoomId, socket.id);
        
        const finalUsername = removedUsername || username;
        if (finalUsername) {
          const updatedUsers = roomManager.getUsersList(formattedRoomId);
          socket.to(formattedRoomId).emit('user-left', {
            username: finalUsername,
            users: updatedUsers
          });
        }
        
        console.log(`User [${finalUsername}] left room [${formattedRoomId}]`);
      }

      // Reset socket state properties
      socket.roomId = null;
      socket.username = null;
    });

    // Handle sudden disconnects
    socket.on('disconnecting', () => {
      // socket.rooms contains the rooms the socket is currently in (including its own id room)
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          const { username, isEmpty } = roomManager.removeUser(room, socket.id);
          
          if (username) {
            const updatedUsers = roomManager.getUsersList(room);
            socket.to(room).emit('user-left', {
              username,
              users: updatedUsers
            });
            console.log(`User [${username}] disconnected from room [${room}]`);
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
