/**
 * Client-side mock data generator for AirSense
 * Generates realistic air quality data when backend is not available (e.g., on Vercel)
 */

class ClientDataGenerator {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.listeners = [];
    this.sensors = [
      { id: "sensor_001", location: "Downtown Station", lat: 43.6532, lon: -79.3832 },
      { id: "sensor_002", location: "Suburban Station", lat: 43.5890, lon: -79.6441 },
      { id: "sensor_003", location: "Industrial Zone", lat: 43.2557, lon: -79.8711 }
    ];
    
    // Base time for consistent but varying data
    this.baseTime = Date.now();
  }

  /**
   * Start generating mock data
   * @param {number} interval - Update interval in milliseconds (default: 10000ms = 10 seconds)
   */
  start(interval = 10000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🎭 Starting client-side data generator');
    
    // Generate initial data immediately
    this.generateAndBroadcastData();
    
    // Set up interval for continuous updates
    this.intervalId = setInterval(() => {
      this.generateAndBroadcastData();
    }, interval);
  }

  /**
   * Stop generating mock data
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 Client-side data generator stopped');
  }

  /**
   * Generate realistic air quality data for all sensors
   */
  generateAndBroadcastData() {
    const currentTime = Date.now();
    const timeOffset = (currentTime - this.baseTime) / 1000; // seconds since start
    
    const sensorData = {};
    
    this.sensors.forEach(sensor => {
      const sensorOffset = this.hashCode(sensor.id) % 100;
      const sensorTime = timeOffset + sensorOffset;
      
      // Generate realistic PM2.5 values (5-35 µg/m³ range)
      const pm25 = this.roundTo(8 + (sensorTime % 25) + (sensorTime % 10) * 0.5, 1);
      
      // PM10 is typically 1.5-2x PM2.5
      const pm10 = this.roundTo(pm25 * 1.7 + (sensorTime % 5), 1);
      
      // CO2 levels (400-600 ppm normal range)
      const co2 = Math.round(420 + (sensorTime % 150) + (sensorTime % 20));
      
      // Temperature varies by location and time
      let temperature;
      if (sensor.location.includes("Downtown")) {
        temperature = this.roundTo(22 + (sensorTime % 8) - 4 + (sensorTime % 3), 1); // 18-26°C
      } else {
        temperature = this.roundTo(20 + (sensorTime % 6) - 3 + (sensorTime % 2), 1); // 17-23°C
      }
      
      // Humidity (40-80% range)
      const humidity = this.roundTo(55 + (sensorTime % 25) + (sensorTime % 7), 1);
      
      // Pressure (1003-1033 hPa)
      const pressure = this.roundTo(1013 + (sensorTime % 20) - 10, 1);
      
      // Calculate AQI from PM2.5
      const aqi = this.calculateAQI(pm25);
      
      sensorData[sensor.id] = {
        sensor_id: sensor.id,
        location: sensor.location,
        pm25: pm25,
        pm10: pm10,
        co2: co2,
        temperature: temperature,
        humidity: humidity,
        pressure: pressure,
        aqi: aqi,
        timestamp: new Date().toISOString()
      };
    });
    
    // Broadcast to all listeners
    this.broadcastSensorData(sensorData);
  }

  /**
   * Calculate Air Quality Index from PM2.5
   * @param {number} pm25 - PM2.5 concentration in µg/m³
   * @returns {number} AQI value
   */
  calculateAQI(pm25) {
    if (pm25 <= 12.0) {
      return Math.round((pm25 / 12.0) * 50);
    } else if (pm25 <= 35.4) {
      return Math.round(50 + ((pm25 - 12.1) / 23.3) * 50);
    } else if (pm25 <= 55.4) {
      return Math.round(100 + ((pm25 - 35.5) / 19.9) * 50);
    } else {
      return Math.round(150 + ((pm25 - 55.5) / 94.9) * 100);
    }
  }

  /**
   * Round number to specified decimal places
   * @param {number} num - Number to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded number
   */
  roundTo(num, decimals) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Simple hash function for consistent sensor offsets
   * @param {string} str - String to hash
   * @returns {number} Hash code
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Add listener for sensor data updates
   * @param {function} callback - Callback function to receive sensor data
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   * @param {function} callback - Callback function to remove
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Broadcast sensor data to all listeners
   * @param {object} sensorData - Sensor data object
   */
  broadcastSensorData(sensorData) {
    this.listeners.forEach(callback => {
      try {
        callback(sensorData);
      } catch (error) {
        console.error('Error in client data generator callback:', error);
      }
    });
  }

  /**
   * Generate a single alert
   * @param {string} sensorId - Sensor ID
   * @param {string} message - Alert message
   * @param {string} severity - Alert severity
   */
  generateAlert(sensorId, message, severity = 'moderate') {
    const alert = {
      id: `alert_${Date.now()}`,
      sensor_id: sensorId,
      type: 'client_generated',
      message: message,
      severity: severity,
      timestamp: new Date().toISOString(),
      active: true
    };
    
    this.broadcastAlert(alert);
  }

  /**
   * Broadcast alert to all listeners
   * @param {object} alert - Alert object
   */
  broadcastAlert(alert) {
    this.listeners.forEach(callback => {
      try {
        // Check if callback expects alert data specifically
        if (callback.name === 'onAlert' || callback.toString().includes('alert')) {
          callback(alert);
        }
      } catch (error) {
        console.error('Error in client alert callback:', error);
      }
    });
  }

  /**
   * Get connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    return this.isRunning ? 'connected' : 'disconnected';
  }
}

// Create singleton instance
export const clientDataGenerator = new ClientDataGenerator();

// Export class for testing
export { ClientDataGenerator };
