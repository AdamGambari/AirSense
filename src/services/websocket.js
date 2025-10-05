import { clientDataGenerator } from './clientDataGenerator';

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
    this.clientDataGenerator = null;
    this.isClientMode = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WS_URL || 
          (process.env.NODE_ENV === 'production' ? 
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws` : 
            'ws://localhost:8000/ws');
        
        // Try to connect to WebSocket with timeout
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            console.log('⏰ WebSocket connection timeout, falling back to client-side data');
            this.startClientMode();
            resolve();
          }
        }, 5000); // 5 second timeout

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('🔗 WebSocket connected');
          this.reconnectAttempts = 0;
          this.isClientMode = false;
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
          clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket disconnected');
          this.notifyConnectionChange('disconnected');
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          console.log('🔄 Falling back to client-side data generation');
          this.startClientMode();
          this.notifyConnectionChange('connected'); // Connected to client mode
          resolve();
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        console.log('🔄 Falling back to client-side data generation');
        this.startClientMode();
        this.notifyConnectionChange('connected'); // Connected to client mode
        resolve();
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

  startClientMode() {
    console.log('🎭 Starting client-side data generation mode');
    this.isClientMode = true;
    this.clientDataGenerator = clientDataGenerator;
    
    // Set up listeners for client data
    this.clientDataGenerator.addListener((data) => {
      this.notifySensorData(data);
    });
    
    // Start generating data
    this.clientDataGenerator.start(10000); // 10 second intervals
  }

  stopClientMode() {
    if (this.clientDataGenerator) {
      this.clientDataGenerator.stop();
      this.clientDataGenerator = null;
    }
    this.isClientMode = false;
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
      console.error('❌ Max reconnection attempts reached, switching to client mode');
      this.startClientMode();
      this.notifyConnectionChange('connected'); // Connected to client mode
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
    this.stopClientMode();
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
    if (this.isClientMode) {
      return 'connected'; // Client mode is considered connected
    }
    
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
