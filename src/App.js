import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SensorMap from './components/SensorMap';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import LoadingScreen from './components/LoadingScreen';

// Services
import { webSocketService } from './services/websocket';
import { ApiService } from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [sensorData, setSensorData] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize WebSocket connection
      await webSocketService.connect();
      
      // Set up WebSocket event listeners
      webSocketService.onSensorData((data) => {
        setSensorData(prev => ({
          ...prev,
          ...data
        }));
      });

      webSocketService.onAlert((alert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      });

      webSocketService.onConnectionChange((status) => {
        setConnectionStatus(status);
      });

      // Load initial data
      await loadInitialData();
      
      setLoading(false);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setConnectionStatus('error');
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load sensor data
      const sensors = await ApiService.getSensors();
      const latestData = await ApiService.getLatestData();
      const alertsData = await ApiService.getAlerts();
      
      setSensorData(latestData.sensors || {});
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -20
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="particle-field">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <Router>
        <Navbar connectionStatus={connectionStatus} />
        
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Dashboard sensorData={sensorData} alerts={alerts} />
                  </motion.div>
                }
              />
              <Route
                path="/map"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SensorMap sensorData={sensorData} />
                  </motion.div>
                }
              />
                  <Route
                    path="/analytics"
                    element={
                      <motion.div
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                      >
                        <Analytics sensorData={sensorData} alerts={alerts} />
                      </motion.div>
                    }
                  />
              <Route
                path="/alerts"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Alerts alerts={alerts} sensorData={sensorData} />
                  </motion.div>
                }
              />
              <Route
                path="/settings"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Settings />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </Router>

    </div>
  );
}

export default App;
