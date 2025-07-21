const express = require('express');
const Room = require('../models/roomModel');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Generate a random 6-character alphanumeric room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// POST /api/rooms/join - Join or create a room
router.post('/join', async (req, res) => {
  try {
    let { roomId } = req.body;

    // If no roomId provided, generate one
    if (!roomId) {
      roomId = generateRoomCode();
    } else {
      roomId = roomId.toUpperCase();
    }

    // Try to find the room
    let room = await Room.findOne({ roomId });

    // Create new room if not found
    if (!room) {
      room = new Room({
        roomId,
        drawingData: [],
        activeUsers: 1,
      });
      await room.save();
      console.log(`Created new room: ${roomId}`);
    }

    res.json({
      success: true,
      roomId: room.roomId,
      drawingData: room.drawingData || [],
      activeUsers: room.activeUsers || []
    });
  } catch (error) {
    console.error('Error in POST /join:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join or create room'
    });
  }
});

// GET /api/rooms/:roomId - Get existing room info
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID'
      });
    }

    const room = await Room.findOne({ roomId: roomId.toUpperCase() });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      roomId: room.roomId,
      drawingData: room.drawingData || [],
      activeUsers: room.activeUsers || [],
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    });
  } catch (error) {
    console.error('Error in GET /:roomId:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve room data'
    });
  }
});

// GET /api/rooms - Generate a unique new room code
router.get('/', async (req, res) => {
  try {
    let roomId;
    let exists = true;

    // Keep generating until a unique roomId is found
    while (exists) {
      roomId = generateRoomCode();
      exists = await Room.exists({ roomId });
    }

    res.json({
      success: true,
      roomId
    });
  } catch (error) {
    console.error('Error in GET /api/rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate new room code'
    });
  }
});

module.exports = router;
