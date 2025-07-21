import React, { useState, useRef } from 'react';

const RoomJoin = ({ onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  console.log('RoomJoin - onJoinRoom type:', typeof onJoinRoom);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...roomCode];
    newCode[index] = value.toUpperCase();
    setRoomCode(newCode);
    
   
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
   
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    
    if (e.key === 'Backspace' && !roomCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
   
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newCode = Array(6).fill('');
    
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    
    setRoomCode(newCode);
    
    
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = roomCode.join('').trim();
    
    if (code.length === 0) return;
    
    if (typeof onJoinRoom !== 'function') {
      console.error('onJoinRoom is not a function:', onJoinRoom);
      setError('Internal error: onJoinRoom is not a function');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await onJoinRoom(code);
    } catch (err) {
      setError(err.message || 'Room not found');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewRoom = async () => {
    if (typeof onJoinRoom !== 'function') {
      console.error('onJoinRoom is not a function:', onJoinRoom);
      setError('Internal error: onJoinRoom is not a function');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onJoinRoom('');
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = roomCode.every(char => char !== '');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
      
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
       
          <div className="text-center mb-8">
           
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Collaborative Whiteboard
            </h1>
            <p className="text-gray-600">
              Create and collaborate in real-time
            </p>
          </div>

        
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

         
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Enter Room Code
              </label>
              
            
              <div className="flex justify-center gap-2 mb-4">
                {roomCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    maxLength={1}
                    disabled={isLoading}
                  />
                ))}
              </div>
              
              <p className="text-gray-500 text-sm text-center">
                6 character room code
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isCodeComplete}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Joining Room...
                </div>
              ) : (
                'Join Room'
              )}
            </button>
          </form>

         
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          
          <button
            onClick={createNewRoom}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mr-2"></div>
                Creating Room...
              </div>
            ) : (
              'Create New Room'
            )}
          </button>
        </div>

       
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Share the room code with others to collaborate
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;