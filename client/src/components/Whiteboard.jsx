/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../services/apiService';


const UserCursors = ({ cursors }) => {
  const cursorColors = [
    '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#6366f1', '#f97316'
  ];

  const getCursorColor = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return cursorColors[Math.abs(hash) % cursorColors.length];
  };

  return (
    <>
      {Object.entries(cursors).map(([userId, cursor]) => {
        if (!cursor.visible || cursor.x === undefined || cursor.y === undefined) {
          return null;
        }

        const color = getCursorColor(userId);

        return (
          <div
            key={userId}
            className="fixed pointer-events-none z-50 transition-all duration-150 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
            }}
          >
            {/* Pointer cursor */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5.5 3L20 12L13 14L9 20L5.5 3Z"
                fill={color}
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
            
            {/* User label */}
            <div 
              className="absolute top-6 left-2 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              User {userId.slice(-4)}
            </div>
          </div>
        );
      })}
    </>
  );
};


const Toolbar = ({
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClearCanvas,
  roomId,
  userCount,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' }
  ];

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Left side - Room info */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 shadow-md">
        <div className="text-gray-800">
          <div className="text-xs text-gray-500 font-medium">ROOM</div>
          <div className="text-sm font-mono font-bold tracking-wider">{roomId}</div>
        </div>
        
        <button
          onClick={copyRoomCode}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Copy room code"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        
        <div className="h-6 w-px bg-gray-200"></div>
        
        <div className="text-gray-800">
          <div className="text-xs text-gray-500 font-medium">USERS</div>
          <div className="text-sm font-bold">{userCount}</div>
        </div>

        <button 
          onClick={onLeaveRoom}
          className="ml-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm font-medium transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Right side - Drawing tools */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 shadow-md">
        {/* Color picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">COLOR</span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className={`w-6 h-6 rounded border-2 transition-all duration-200 hover:scale-110 ${
                  currentColor === color.value
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        {/* Stroke width */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">SIZE</span>
          <span className="text-sm font-medium text-gray-700 w-8">{strokeWidth}px</span>
          <input
            type="range"
            min="2"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
            className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        {/* Clear button */}
        <button
          onClick={onClearCanvas}
          className="px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 text-sm font-medium transition-colors"
          title="Clear canvas"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Main Whiteboard Component
const Whiteboard = ({ socket, roomId, onLeaveRoom }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [, setRoomInfo] = useState(null);
  const [activeUsers, setActiveUsers] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userCursors, setUserCursors] = useState({});
  const [currentStrokeId, setCurrentStrokeId] = useState(null);
  const [lastPoint, setLastPoint] = useState(null);

  // Initialize canvas with proper dimensions and white background
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Set canvas display size
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Set actual canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Initialize canvas on mount and resize
  useEffect(() => {
    initializeCanvas();
    
    const handleResize = () => {
      // Store current drawing
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);
      
      // Reinitialize canvas
      initializeCanvas();
      
      // Restore drawing
      const newCtx = canvas.getContext('2d');
      newCtx.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Load room data when component mounts
  useEffect(() => {
    if (roomId) {
      loadRoomData();
    }
  }, [roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDrawStart = (data) => {
      console.log('Received draw-start:', data);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    };

    const handleDrawMove = (data) => {
      console.log('Received draw-move:', data);
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    };

    const handleDrawEnd = (data) => {
      console.log('Received draw-end:', data);
    };

    const handleUserJoined = (data) => {
      console.log('User joined:', data);
      setActiveUsers(prev => data.userCount || prev + 1);
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setActiveUsers(prev => data.userCount || Math.max(1, prev - 1));
      setUserCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    };

    const handleRoomJoined = (data) => {
      console.log('Room joined:', data);
      setActiveUsers(data.userCount || 1);
      
      if (data.drawingData && data.drawingData.length > 0) {
        setTimeout(() => redrawFromCommands(data.drawingData), 100);
      }
    };

    const handleCursorUpdate = (data) => {
      setUserCursors(prev => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          visible: data.visible
        }
      }));
    };

    const handleCanvasCleared = () => {
      console.log('Canvas cleared by another user');
      clearCanvas();
    };

    socket.on('draw-start', handleDrawStart);
    socket.on('draw-move', handleDrawMove);
    socket.on('draw-end', handleDrawEnd);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('room-joined', handleRoomJoined);
    socket.on('cursor-update', handleCursorUpdate);
    socket.on('canvas-cleared', handleCanvasCleared);

    return () => {
      socket.off('draw-start', handleDrawStart);
      socket.off('draw-move', handleDrawMove);
      socket.off('draw-end', handleDrawEnd);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('room-joined', handleRoomJoined);
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('canvas-cleared', handleCanvasCleared);
    };
  }, [socket]);

  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      const roomData = await apiService.getRoomInfo(roomId);
      
      if (roomData.success) {
        setRoomInfo(roomData);
        setActiveUsers(roomData.activeUsers || 1);
        
        if (roomData.drawingData && roomData.drawingData.length > 0) {
          setTimeout(() => redrawFromCommands(roomData.drawingData), 100);
        }
      }
    } catch (error) {
      console.error('Failed to load room data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const redrawFromCommands = (drawingCommands) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Clear and set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    const strokes = {};
    
    drawingCommands.forEach(command => {
      if (command.type === 'clear') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        Object.keys(strokes).forEach(key => delete strokes[key]);
        return;
      }
      
      if (command.type === 'stroke') {
        const { strokeId, action, x, y, color, width } = command.data;
        
        if (action === 'start') {
          strokes[strokeId] = {
            color,
            width,
            points: [{ x, y }]
          };
        } else if (action === 'move' && strokes[strokeId]) {
          strokes[strokeId].points.push({ x, y });
        } else if (action === 'end' && strokes[strokeId]) {
          const stroke = strokes[strokeId];
          if (stroke.points.length > 0) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            stroke.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            
            ctx.stroke();
          }
        }
      }
    });
  };

  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX / (window.devicePixelRatio || 1),
      y: (e.clientY - rect.top) * scaleY / (window.devicePixelRatio || 1)
    };
  }, []);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const { x, y } = getCanvasCoordinates(e);
    setLastPoint({ x, y });
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up drawing context
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Create stroke ID for socket communication
    const strokeId = `${Date.now()}-${Math.random()}`;
    setCurrentStrokeId(strokeId);
    
    // Emit to socket if available
    if (socket) {
      socket.emit('draw-start', {
        roomId,
        x,
        y,
        color: currentColor,
        width: currentSize,
        strokeId
      });
    }
  }, [socket, roomId, currentColor, currentSize, getCanvasCoordinates]);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const { x, y } = getCanvasCoordinates(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Draw line from last point to current point
    if (lastPoint) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    setLastPoint({ x, y });
    
    // Emit to socket if available
    if (socket && currentStrokeId) {
      socket.emit('draw-move', {
        roomId,
        x,
        y,
        strokeId: currentStrokeId
      });
    }
  }, [isDrawing, socket, roomId, currentStrokeId, getCanvasCoordinates, lastPoint]);

  const stopDrawing = useCallback((e) => {
    if (!isDrawing) return;
    e?.preventDefault();
    
    setIsDrawing(false);
    setLastPoint(null);
    
    // Emit to socket if available
    if (socket && currentStrokeId) {
      socket.emit('draw-end', {
        roomId,
        strokeId: currentStrokeId
      });
    }
    
    setCurrentStrokeId(null);
  }, [isDrawing, socket, roomId, currentStrokeId]);

  const handleMouseMove = useCallback((e) => {
    // Update cursor position for other users
    if (socket) {
      socket.emit('cursor-move', {
        roomId,
        x: e.clientX,
        y: e.clientY,
        visible: true
      });
    }
    
    // Draw if currently drawing
    if (isDrawing) {
      draw(e);
    }
  }, [socket, roomId, isDrawing, draw]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }, []);

  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    if (socket) {
      socket.emit('clear-canvas', { roomId });
    }
  }, [clearCanvas, socket, roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
     
      <UserCursors cursors={userCursors} />
      
      
      <Toolbar
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        strokeWidth={currentSize}
        onStrokeWidthChange={setCurrentSize}
        onClearCanvas={handleClearCanvas}
        roomId={roomId}
        userCount={typeof activeUsers === 'number' ? activeUsers : activeUsers.length}
        onLeaveRoom={onLeaveRoom}
      />

    
      <div className="absolute inset-0 p-4 pt-28">
        <div className="w-full h-full bg-white border-4 border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair touch-none w-full h-full"
            style={{ 
              touchAction: 'none',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;