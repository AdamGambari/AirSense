import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, AlertCircle, CheckCircle, X } from 'lucide-react';
import { notificationService } from '../services/notifications';

const Alerts = ({ alerts, sensorData }) => {
  const [alertFilters, setAlertFilters] = useState('all');
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  // Generate alerts based on sensor data - memoized to prevent constant regeneration
  const generatedAlerts = useMemo(() => {
    const alerts = [];
    
    if (sensorData) {
      Object.entries(sensorData).forEach(([sensorId, data]) => {
        // PM2.5 alerts
        if (data.pm25 > 25) {
          alerts.push({
            id: `pm25_${sensorId}`,
            type: 'warning',
            severity: data.pm25 > 35 ? 'high' : 'medium',
            title: 'High PM2.5 Levels',
            message: `PM2.5 levels at ${data.pm25.toFixed(1)} µg/m³ exceed recommended limits`,
            sensor: sensorId,
            location: data.location,
            timestamp: new Date().toISOString(),
            value: data.pm25,
            threshold: 25
          });
        }
        
        // Temperature alerts
        if (data.temperature > 30 || data.temperature < 5) {
          alerts.push({
            id: `temp_${sensorId}`,
            type: 'warning',
            severity: 'medium',
            title: 'Temperature Alert',
            message: `Temperature at ${data.temperature.toFixed(1)}°C is outside normal range`,
            sensor: sensorId,
            location: data.location,
            timestamp: new Date().toISOString(),
            value: data.temperature,
            threshold: data.temperature > 30 ? 30 : 5
          });
        }
        
        // CO2 alerts
        if (data.co2 > 600) {
          alerts.push({
            id: `co2_${sensorId}`,
            type: 'info',
            severity: 'medium',
            title: 'Elevated CO2 Levels',
            message: `CO2 levels at ${data.co2} ppm are above recommended levels`,
            sensor: sensorId,
            location: data.location,
            timestamp: new Date().toISOString(),
            value: data.co2,
            threshold: 600
          });
        }
      });
    }

    // Add some system alerts
    alerts.push({
      id: `system_status`,
      type: 'info',
      severity: 'low',
      title: 'System Status',
      message: 'All sensors are operating normally',
      sensor: 'system',
      location: 'System',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      value: null,
      threshold: null
    });

    return alerts;
  }, [sensorData]);

  const allAlerts = [...(alerts || []), ...generatedAlerts];
  const filteredAlerts = allAlerts.filter(alert => {
    if (dismissedAlerts.has(alert.id)) return false;
    if (alertFilters === 'all') return true;
    return alert.severity === alertFilters;
  });

  // Show notifications for new alerts
  useEffect(() => {
    filteredAlerts.forEach(alert => {
      // Only show notifications for high/medium severity alerts
      if (alert.severity === 'high' || alert.severity === 'medium') {
        notificationService.showAlert(alert);
      }
    });
  }, [filteredAlerts]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertIcon = (type, severity) => {
    if (type === 'info') return <CheckCircle className="w-5 h-5" />;
    if (severity === 'high') return <AlertTriangle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getAlertColor = (severity) => {
    if (severity === 'high') return 'border-red-500 bg-red-500/10 high-priority';
    if (severity === 'medium') return 'border-yellow-500 bg-yellow-500/10 medium-priority';
    return 'border-blue-500 bg-blue-500/10 low-priority';
  };

  const getSeverityCounts = () => {
    const counts = { all: 0, high: 0, medium: 0, low: 0 };
    allAlerts.forEach(alert => {
      if (!dismissedAlerts.has(alert.id)) {
        counts.all++;
        counts[alert.severity]++;
      }
    });
    return counts;
  };

  const severityCounts = getSeverityCounts();

  return (
    <motion.div 
      className="alerts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="alerts-header">
        <h1 className="alerts-title">Alerts Center</h1>
        <p className="alerts-subtitle">Air quality alerts and notifications</p>
        
        <div className="alert-filters">
          <button 
            className={alertFilters === 'all' ? 'active' : ''} 
            onClick={() => setAlertFilters('all')}
          >
            All ({severityCounts.all})
          </button>
          <button 
            className={alertFilters === 'high' ? 'active' : ''} 
            onClick={() => setAlertFilters('high')}
          >
            High ({severityCounts.high})
          </button>
          <button 
            className={alertFilters === 'medium' ? 'active' : ''} 
            onClick={() => setAlertFilters('medium')}
          >
            Medium ({severityCounts.medium})
          </button>
          <button 
            className={alertFilters === 'low' ? 'active' : ''} 
            onClick={() => setAlertFilters('low')}
          >
            Low ({severityCounts.low})
          </button>
        </div>
      </div>
      
      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <Bell className="w-16 h-16 text-gray-500 mb-4" />
            <h3>No Alerts</h3>
            <p>All systems are operating normally</p>
          </div>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                className={`alert-item ${getAlertColor(alert.severity)}`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="alert-icon">
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                
                <div className="alert-content">
                  <div className="alert-header">
                    <h4 className="alert-title">{alert.title}</h4>
                    <span className={`alert-severity ${alert.severity}`}>{alert.severity}</span>
                  </div>
                  
                  <p className="alert-message">{alert.message}</p>
                  
                  <div className="alert-details">
                    <span className="alert-location">📍 {alert.location}</span>
                    <span className="alert-time">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {alert.value && (
                      <span className="alert-value">
                        Current: {alert.value.toFixed(1)}
                        {alert.threshold && ` (Threshold: ${alert.threshold})`}
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  className="dismiss-btn"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Alerts;
