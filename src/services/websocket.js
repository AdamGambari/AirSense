class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = {
      sensorData: [],
      alert: [],
      connectionChange: []
    };
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WS_URL || 
          (process.env.NODE_ENV === 'production' ? 
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws` : 
            'ws://localhost:8000/ws');
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('🔗 WebSocket connected');
          this.reconnectAttempts = 0;
          this.notifyConnectionChange('connected');
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.notifyConnectionChange('disconnected');
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.notifyConnectionChange('error');
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  handleMessage(data) {
    switch (data.type) {
      case 'sensor_data':
        this.notifySensorData(data.data);
        break;
      case 'sensor_update':
        this.notifySensorData(data.data);
        break;
      case 'alert':
        this.notifyAlert(data.alert);
        break;
      case 'ping':
        // Respond to ping
        this.send({ type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnection failed, will be handled by attemptReconnect
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.notifyConnectionChange('error');
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Event listeners
  onSensorData(callback) {
    this.listeners.sensorData.push(callback);
  }

  onAlert(callback) {
    this.listeners.alert.push(callback);
  }

  onConnectionChange(callback) {
    this.listeners.connectionChange.push(callback);
  }

  removeListener(type, callback) {
    const index = this.listeners[type].indexOf(callback);
    if (index > -1) {
      this.listeners[type].splice(index, 1);
    }
  }

  // Notify listeners
  notifySensorData(data) {
    this.listeners.sensorData.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in sensor data callback:', error);
      }
    });
  }

  notifyAlert(alert) {
    this.listeners.alert.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  notifyConnectionChange(status) {
    this.listeners.connectionChange.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    });
  }

  // Connection status
  getConnectionStatus() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Subscribe to specific sensor
  subscribeToSensor(sensorId) {
    this.send({
      type: 'subscribe',
      sensor_id: sensorId
    });
  }

  // Unsubscribe from sensor
  unsubscribeFromSensor(sensorId) {
    this.send({
      type: 'unsubscribe',
      sensor_id: sensorId
    });
  }

  // Request historical data
  requestHistoricalData(sensorId, hours = 24) {
    this.send({
      type: 'historical_data',
      sensor_id: sensorId,
      hours: hours
    });
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Export class for testing
export { WebSocketService };
