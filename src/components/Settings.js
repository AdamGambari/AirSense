import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Monitor, Globe, Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    alerts: {
      pm25Threshold: 25,
      temperatureThreshold: 30,
      co2Threshold: 600,
      humidityThreshold: 80
    },
    display: {
      theme: 'dark',
      units: 'metric',
      refreshRate: 10
    },
    system: {
      autoConnect: true,
      dataRetention: 30,
      debugMode: false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Save to localStorage
    localStorage.setItem('airsense-settings', JSON.stringify(settings));
    setHasChanges(false);
    // Show success message (you could add a toast notification here)
    console.log('Settings saved successfully!');
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      alerts: {
        pm25Threshold: 25,
        temperatureThreshold: 30,
        co2Threshold: 600,
        humidityThreshold: 80
      },
      display: {
        theme: 'dark',
        units: 'metric',
        refreshRate: 10
      },
      system: {
        autoConnect: true,
        dataRetention: 30,
        debugMode: false
      }
    });
    setHasChanges(true);
  };

  return (
    <motion.div 
      className="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Configure your AirSense preferences</p>
      </div>
      
      <div className="settings-container">
        <div className="settings-grid">
          {/* Notifications */}
          <motion.div 
            className="settings-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="section-header">
              <Bell className="w-6 h-6" />
              <h3>Notifications</h3>
            </div>
            
                <div 
                  className={`notification-card ${settings.notifications.email ? 'enabled' : 'disabled'}`}
                  onClick={() => updateSetting('notifications', 'email', !settings.notifications.email)}
                >
                  <div className="notification-icon">
                    📧
                  </div>
                  <div className="notification-content">
                    <h4>Email notifications</h4>
                    <p>Receive alerts via email</p>
                  </div>
                </div>
                
                <div 
                  className={`notification-card ${settings.notifications.push ? 'enabled' : 'disabled'}`}
                  onClick={() => updateSetting('notifications', 'push', !settings.notifications.push)}
                >
                  <div className="notification-icon">
                    📢
                  </div>
                  <div className="notification-content">
                    <h4>Push notifications</h4>
                    <p>Browser push notifications</p>
                  </div>
                </div>
                
                <div 
                  className={`notification-card ${settings.notifications.sms ? 'enabled' : 'disabled'}`}
                  onClick={() => updateSetting('notifications', 'sms', !settings.notifications.sms)}
                >
                  <div className="notification-icon">
                    📱
                  </div>
                  <div className="notification-content">
                    <h4>SMS notifications</h4>
                    <p>Text message alerts</p>
                  </div>
                </div>
          </motion.div>

          {/* Alert Thresholds */}
          <motion.div 
            className="settings-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-header">
              <Shield className="w-6 h-6" />
              <h3>Alert Thresholds</h3>
            </div>
            
            <div className="setting-item">
              <label>PM2.5 Alert Threshold (µg/m³)</label>
              <input 
                type="number" 
                value={settings.alerts.pm25Threshold}
                onChange={(e) => updateSetting('alerts', 'pm25Threshold', parseInt(e.target.value))}
                min="5" 
                max="100"
              />
            </div>
            
            <div className="setting-item">
              <label>Temperature Alert Threshold (°C)</label>
              <input 
                type="number" 
                value={settings.alerts.temperatureThreshold}
                onChange={(e) => updateSetting('alerts', 'temperatureThreshold', parseInt(e.target.value))}
                min="0" 
                max="50"
              />
            </div>
            
            <div className="setting-item">
              <label>CO2 Alert Threshold (ppm)</label>
              <input 
                type="number" 
                value={settings.alerts.co2Threshold}
                onChange={(e) => updateSetting('alerts', 'co2Threshold', parseInt(e.target.value))}
                min="400" 
                max="2000"
              />
            </div>
            
            <div className="setting-item">
              <label>Humidity Alert Threshold (%)</label>
              <input 
                type="number" 
                value={settings.alerts.humidityThreshold}
                onChange={(e) => updateSetting('alerts', 'humidityThreshold', parseInt(e.target.value))}
                min="0" 
                max="100"
              />
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div 
            className="settings-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <Monitor className="w-6 h-6" />
              <h3>Display</h3>
            </div>
            
                <div className="setting-item">
                  <label>Theme</label>
                  <div className="theme-info">
                    <span className="theme-current">🌙 Dark Theme</span>
                    <p className="theme-description">AirSense uses a beautiful dark theme optimized for air quality monitoring</p>
                  </div>
                </div>
            
            <div className="setting-item">
              <label>Units</label>
              <select 
                value={settings.display.units}
                onChange={(e) => updateSetting('display', 'units', e.target.value)}
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Data Refresh Rate (seconds)</label>
              <select 
                value={settings.display.refreshRate}
                onChange={(e) => updateSetting('display', 'refreshRate', parseInt(e.target.value))}
              >
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
              </select>
            </div>
          </motion.div>

          {/* System Settings */}
          <motion.div 
            className="settings-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="section-header">
              <Globe className="w-6 h-6" />
              <h3>System</h3>
            </div>
            
                <div 
                  className={`system-card ${settings.system.autoConnect ? 'enabled' : 'disabled'}`}
                  onClick={() => updateSetting('system', 'autoConnect', !settings.system.autoConnect)}
                >
                  <div className="system-icon">
                    🔗
                  </div>
                  <div className="system-content">
                    <h4>Auto-connect to sensors</h4>
                    <p>Automatically connect to available sensors</p>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label>Data Retention (days)</label>
                  <select 
                    value={settings.system.dataRetention}
                    onChange={(e) => updateSetting('system', 'dataRetention', parseInt(e.target.value))}
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                
                <div 
                  className={`system-card ${settings.system.debugMode ? 'enabled' : 'disabled'}`}
                  onClick={() => updateSetting('system', 'debugMode', !settings.system.debugMode)}
                >
                  <div className="system-icon">
                    🐛
                  </div>
                  <div className="system-content">
                    <h4>Debug mode</h4>
                    <p>Enable detailed logging and diagnostics</p>
                  </div>
                </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="settings-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            className="save-btn"
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          
          <button 
            className="reset-btn"
            onClick={resetSettings}
          >
            Reset to Defaults
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
