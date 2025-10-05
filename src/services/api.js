import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export const ApiService = {
  // Health check
  async getHealth() {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Get all sensors
  async getSensors() {
    try {
      const response = await apiClient.get('/api/sensors');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
      throw error;
    }
  },

  // Get latest sensor data
  async getLatestData() {
    try {
      const response = await apiClient.get('/api/data/latest');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
      throw error;
    }
  },

  // Get historical data
  async getHistoricalData(sensorId, hours = 24) {
    try {
      const response = await apiClient.get(`/api/data/historical?sensor_id=${sensorId}&hours=${hours}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      throw error;
    }
  },

  // Get alerts
  async getAlerts() {
    try {
      const response = await apiClient.get('/api/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }
  },

  // Create alert
  async createAlert(alertData) {
    try {
      const response = await apiClient.post('/api/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  },

  // Get sensor by ID
  async getSensor(sensorId) {
    try {
      const response = await apiClient.get(`/api/sensors/${sensorId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sensor:', error);
      throw error;
    }
  },

  // Update sensor settings
  async updateSensor(sensorId, settings) {
    try {
      const response = await apiClient.put(`/api/sensors/${sensorId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update sensor:', error);
      throw error;
    }
  },

  // Get analytics data
  async getAnalytics(timeRange = '24h') {
    try {
      const response = await apiClient.get(`/api/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  },

  // Get air quality forecast
  async getForecast(location) {
    try {
      const response = await apiClient.get(`/api/forecast?location=${location}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
      throw error;
    }
  }
};

export default ApiService;
