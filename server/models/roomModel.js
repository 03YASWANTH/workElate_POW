const mongoose = require('mongoose');

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['stroke', 'clear'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema],
  activeUsers: {
    type: Number,
    default: 0
  }
});


// Auto-delete rooms older than 24 hours
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

// Update lastActivity before saving
roomSchema.pre('save', function() {
  this.lastActivity = new Date();
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;