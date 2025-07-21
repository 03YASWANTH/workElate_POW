import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import apiService from './services/apiService';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('connect_error', (error) => {
      setConnectionError('Failed to connect to server');
      console.error('Connection error:', error);
    });

    socketInstance.on('room-joined', (data) => {
      setCurrentRoom(data.roomId);
    });

    socketInstance.on('room-error', (error) => {
      setConnectionError(error.message);
      setCurrentRoom(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleJoinRoom = async (roomCode) => {
    if (!socket || !isConnected) {
      setConnectionError('Not connected to server');
      return;
    }

    setConnectionError(null);

    try {
      
      const roomData = await apiService.joinRoom(roomCode || null);

      if (roomData.success) {
        setCurrentRoom(roomData.roomId);
        
        socket.emit('join-room', { roomId: roomData.roomId });
      } else {
        setConnectionError(roomData.error || 'Failed to join room');
      }
    } catch (error) {
      setConnectionError(error.message || 'Failed to join room');
      console.error('Room join error:', error);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    if (socket) {
      socket.emit('leave-room');
    }
  };

 
  const ErrorDisplay = () => {
    if (!connectionError) return null;
    
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="glass-card px-6 py-3 rounded-2xl bg-red-500/20 border border-red-400/30">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-medium">{connectionError}</span>
            <button
              onClick={() => setConnectionError(null)}
              className="ml-2 text-white/60 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <ErrorDisplay />
      
      {!currentRoom ? (
        <RoomJoin onJoinRoom={handleJoinRoom} />
      ) : (
        <Whiteboard 
          socket={socket}
          roomId={currentRoom}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
}

export default App;