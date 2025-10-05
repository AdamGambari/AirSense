import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Map, 
  BarChart3, 
  Bell, 
  Settings, 
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import './Navbar.css';

const Navbar = ({ connectionStatus }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-orange-400 animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <motion.div 
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <Activity className="w-8 h-8" />
            </div>
            <div className="logo-text">
              <span className="logo-title">AirSense</span>
              <span className="logo-subtitle">Air Quality Monitor</span>
            </div>
          </Link>
        </motion.div>

        {/* Navigation Links */}
        <div className="navbar-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="nav-label">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="activeIndicator"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Connection Status */}
        <div className="navbar-status">
          <div className="status-indicator">
            {getConnectionIcon()}
            <span className="status-text">
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'connecting' && 'Connecting'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
              {connectionStatus === 'error' && 'Error'}
            </span>
          </div>
        </div>
      </div>

      {/* Animated Background */}
      <div className="navbar-bg">
        <div className="bg-gradient"></div>
        <div className="bg-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
