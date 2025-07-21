// src/services/apiService.js
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
  }

  // Helper method for making requests
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Join existing room or create new room (handles both cases)
  // If roomId is null/empty, creates a new room
  // If roomId is provided, joins existing room or creates if doesn't exist
  async joinRoom(roomId = null) {
    return this.makeRequest('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ roomId })
    });
  }

  // Get existing room info
  async getRoomInfo(roomId) {
    return this.makeRequest(`/rooms/${roomId}`);
  }

  // Generate a unique new room code (optional - can be removed since /join handles this)
  async generateNewRoom() {
    return this.makeRequest('/rooms');
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/');
  }
}

export default new ApiService();