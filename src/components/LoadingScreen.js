import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      {/* Animated Background */}
      <div className="loading-bg">
        <div className="bg-gradient"></div>
        <div className="particle-field">
          {[...Array(100)].map((_, i) => (
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

      {/* Loading Content */}
      <div className="loading-content">
        <motion.div
          className="logo-container"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="logo-icon">
            <Activity className="w-16 h-16" />
          </div>
        </motion.div>

        <motion.div
          className="loading-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="loading-title">AirSense</h1>
          <p className="loading-subtitle">Air Quality Monitoring System</p>
        </motion.div>

        <motion.div
          className="loading-spinner-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </motion.div>

        <motion.div
          className="loading-progress"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          <p className="progress-text">Initializing sensors...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
