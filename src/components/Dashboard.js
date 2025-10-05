import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ sensorData, alerts }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'var(--accent-green)';
    if (aqi <= 100) return 'var(--accent-orange)';
    if (aqi <= 150) return 'var(--accent-red)';
    return 'var(--accent-purple)';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy';
    return 'Hazardous';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const sensorCards = Object.entries(sensorData).map(([sensorId, data]) => (
    <motion.div
      key={sensorId}
      className="sensor-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="sensor-header">
        <div className="sensor-info">
          <h3 className="sensor-name">{data.location}</h3>
          <p className="sensor-id">ID: {sensorId}</p>
        </div>
        <div className="sensor-status online">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
      </div>

      <div className="sensor-metrics">
        <div className="metric-row">
          <div className="metric-item">
            <div className="metric-icon">
              <Activity className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <span className="metric-label">AQI</span>
              <span 
                className="metric-value"
                style={{ color: getAQIColor(data.aqi) }}
              >
                {data.aqi}
              </span>
              <span className="metric-status">{getAQIStatus(data.aqi)}</span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Temperature</span>
              <span className="metric-value">{data.temperature}°C</span>
              <span className="metric-trend">
                {getTrendIcon(data.temperature, data.temperature - 2)}
              </span>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-item">
            <div className="metric-icon">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <span className="metric-label">Humidity</span>
              <span className="metric-value">{data.humidity}%</span>
              <span className="metric-trend">
                {getTrendIcon(data.humidity, data.humidity + 1)}
              </span>
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-icon">
              <Wind className="w-5 h-5" />
            </div>
            <div className="metric-content">
              <span className="metric-label">PM2.5</span>
              <span className="metric-value">{data.pm25} μg/m³</span>
              <span className="metric-trend">
                {getTrendIcon(data.pm25, data.pm25 - 1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sensor-footer">
        <span className="last-update">
          Last updated: {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  ));

  return (
    <div className="dashboard">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-main">AirSense</span>
            <span className="title-sub">Real-time Air Quality Monitoring</span>
          </h1>
          <div className="header-info">
            <div className="time-display">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="date-display">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="quick-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="stat-card">
          <div className="stat-icon">
            <Activity className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{Object.keys(sensorData).length}</span>
            <span className="stat-label">Active Sensors</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">{alerts.length}</span>
            <span className="stat-label">Active Alerts</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {Math.round(Object.values(sensorData).reduce((avg, data) => avg + data.aqi, 0) / Object.keys(sensorData).length || 0)}
            </span>
            <span className="stat-label">Average AQI</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Thermometer className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {(Object.values(sensorData).reduce((avg, data) => avg + data.temperature, 0) / Object.keys(sensorData).length || 0).toFixed(1)}°C
            </span>
            <span className="stat-label">Avg Temperature</span>
          </div>
        </div>
      </motion.div>

      {/* Sensor Cards */}
      <div className="sensor-grid">
        {sensorCards.length > 0 ? sensorCards : (
          <motion.div 
            className="no-data-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Activity className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="no-data-title">No Sensor Data Available</h3>
            <p className="no-data-message">
              Waiting for sensor data to be received...
            </p>
          </motion.div>
        )}
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <motion.div 
          className="recent-alerts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="section-title">Recent Alerts</h2>
          <div className="alerts-list">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={index}
                className="alert-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="alert-icon">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="alert-content">
                  <span className="alert-message">{alert.message}</span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
