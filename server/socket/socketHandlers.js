const Room = require('../models/roomModel');

// Store active users per room
const activeRooms = new Map();

const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    let currentRoom = null;
    let userCursor = { x: 0, y: 0, visible: false };

    // Join room
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        
        if (!roomId) {
          socket.emit('error', { message: 'Room ID is required' });
          return;
        }

        // Leave previous room if any
        if (currentRoom) {
          socket.leave(currentRoom);
          await updateRoomUserCount(currentRoom, -1);
        }

        // Join new room
        socket.join(roomId.toUpperCase());
        currentRoom = roomId.toUpperCase();
        
        // Initialize room data if not exists
        if (!activeRooms.has(currentRoom)) {
          activeRooms.set(currentRoom, new Map());
        }
        
        // Add user to active room
        activeRooms.get(currentRoom).set(socket.id, {
          socketId: socket.id,
          cursor: userCursor,
          joinedAt: new Date()
        });

        // Update database user count
        await updateRoomUserCount(currentRoom, 1);
        
        // Get room data
        const room = await Room.findOne({ roomId: currentRoom });
        if (room) {
          // Send existing drawing data to new user
          socket.emit('room-joined', {
            roomId: currentRoom,
            drawingData: room.drawingData,
            userCount: activeRooms.get(currentRoom).size
          });

          // Notify others about new user
          socket.to(currentRoom).emit('user-joined', {
            userCount: activeRooms.get(currentRoom).size
          });
        }

        console.log(`User ${socket.id} joined room ${currentRoom}`);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (!currentRoom) return;

      const { x, y, visible = true } = data;
      userCursor = { x, y, visible };

      // Update user cursor in active room
      const roomUsers = activeRooms.get(currentRoom);
      if (roomUsers && roomUsers.has(socket.id)) {
        roomUsers.get(socket.id).cursor = userCursor;
        
        // Broadcast cursor position to other users in room
        socket.to(currentRoom).emit('cursor-update', {
          userId: socket.id,
          x,
          y,
          visible
        });
      }
    });

    // Handle drawing start
    socket.on('draw-start', async (data) => {
      if (!currentRoom) return;

      const drawingCommand = {
        type: 'stroke',
        data: {
          action: 'start',
          x: data.x,
          y: data.y,
          color: data.color,
          width: data.width,
          strokeId: data.strokeId || socket.id + '-' + Date.now()
        },
        timestamp: new Date()
      };

      // Save to database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { $push: { drawingData: drawingCommand } }
        );
      } catch (error) {
        console.error('Error saving draw-start:', error);
      }

      // Broadcast to other users
      socket.to(currentRoom).emit('draw-start', drawingCommand.data);
    });

    // Handle drawing movement
    socket.on('draw-move', async (data) => {
      if (!currentRoom) return;

      const drawingCommand = {
        type: 'stroke',
        data: {
          action: 'move',
          x: data.x,
          y: data.y,
          strokeId: data.strokeId
        },
        timestamp: new Date()
      };

      // Save to database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { $push: { drawingData: drawingCommand } }
        );
      } catch (error) {
        console.error('Error saving draw-move:', error);
      }

      // Broadcast to other users
      socket.to(currentRoom).emit('draw-move', drawingCommand.data);
    });

    // Handle drawing end
    socket.on('draw-end', async (data) => {
      if (!currentRoom) return;

      const drawingCommand = {
        type: 'stroke',
        data: {
          action: 'end',
          strokeId: data.strokeId
        },
        timestamp: new Date()
      };

      // Save to database
      try {
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { $push: { drawingData: drawingCommand } }
        );
      } catch (error) {
        console.error('Error saving draw-end:', error);
      }

      // Broadcast to other users
      socket.to(currentRoom).emit('draw-end', drawingCommand.data);
    });

    // Handle clear canvas
    socket.on('clear-canvas', async () => {
      if (!currentRoom) return;

      try {
        // Clear drawing data in database
        await Room.findOneAndUpdate(
          { roomId: currentRoom },
          { 
            $set: { drawingData: [] },
            $push: { 
              drawingData: {
                type: 'clear',
                data: { action: 'clear' },
                timestamp: new Date()
              }
            }
          }
        );

        // Broadcast to all users in room (including sender)
        io.to(currentRoom).emit('canvas-cleared');

      } catch (error) {
        console.error('Error clearing canvas:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (currentRoom) {
        // Remove user from active room
        const roomUsers = activeRooms.get(currentRoom);
        if (roomUsers) {
          roomUsers.delete(socket.id);
          
          // Update database user count
          await updateRoomUserCount(currentRoom, -1);
          
          // Clean up empty rooms
          if (roomUsers.size === 0) {
            activeRooms.delete(currentRoom);
          }
          
          // Notify others about user leaving
          socket.to(currentRoom).emit('user-left', {
            userCount: roomUsers.size,
            userId: socket.id
          });
        }
      }
    });
  });

  // Helper function to update user count in database
  async function updateRoomUserCount(roomId, delta) {
    try {
      const room = await Room.findOne({ roomId });
      if (room) {
        const newCount = Math.max(0, (room.activeUsers || 0) + delta);
        await Room.findOneAndUpdate(
          { roomId },
          { 
            $set: { activeUsers: newCount },
            $currentDate: { lastActivity: true }
          }
        );
      }
    } catch (error) {
      console.error('Error updating room user count:', error);
    }
  }
};

module.exports = socketHandlers;