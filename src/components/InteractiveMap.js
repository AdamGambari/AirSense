import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const InteractiveMap = ({ sensorData }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    // Dynamically import Leaflet components to avoid SSR issues
    const loadMap = async () => {
      try {
        const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
        const L = await import('leaflet');
        
        // Fix default markers in React
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        setMapComponent(() => ({ MapContainer, TileLayer, Marker, Popup }));
        setMapLoaded(true);
      } catch (error) {
        console.error('Failed to load map:', error);
        // Fallback to static map display
        setMapLoaded(false);
      }
    };

    loadMap();
  }, []);

  const sensors = [
    {
      id: "sensor_001",
      name: "Downtown Station",
      location: "Toronto, ON",
      coordinates: [43.6532, -79.3832],
      aqi: sensorData?.sensor_001?.aqi || 0,
      pm25: sensorData?.sensor_001?.pm25 || 0,
      pm10: sensorData?.sensor_001?.pm10 || 0,
      temperature: sensorData?.sensor_001?.temperature || 0,
      humidity: sensorData?.sensor_001?.humidity || 0,
      co2: sensorData?.sensor_001?.co2 || 0,
      status: "online"
    },
    {
      id: "sensor_002", 
      name: "Suburban Station",
      location: "Mississauga, ON",
      coordinates: [43.5890, -79.6441],
      aqi: sensorData?.sensor_002?.aqi || 0,
      pm25: sensorData?.sensor_002?.pm25 || 0,
      pm10: sensorData?.sensor_002?.pm10 || 0,
      temperature: sensorData?.sensor_002?.temperature || 0,
      humidity: sensorData?.sensor_002?.humidity || 0,
      co2: sensorData?.sensor_002?.co2 || 0,
      status: "online"
    },
    {
      id: "sensor_003",
      name: "Industrial Station", 
      location: "Brampton, ON",
      coordinates: [43.6834, -79.7663],
      aqi: sensorData?.sensor_003?.aqi || 0,
      pm25: sensorData?.sensor_003?.pm25 || 0,
      pm10: sensorData?.sensor_003?.pm10 || 0,
      temperature: sensorData?.sensor_003?.temperature || 0,
      humidity: sensorData?.sensor_003?.humidity || 0,
      co2: sensorData?.sensor_003?.co2 || 0,
      status: "online"
    }
  ];

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#10b981"; // Green
    if (aqi <= 100) return "#f59e0b"; // Yellow
    if (aqi <= 150) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    return "Unhealthy";
  };

  const getMarkerColor = (aqi) => {
    return getAQIColor(aqi);
  };

  if (!mapLoaded || !MapComponent) {
    // Fallback to static map display
    return (
      <motion.div 
        className="sensor-map"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="map-header">
          <h1 className="map-title">Sensor Map</h1>
          <p className="map-subtitle">Real-time sensor locations and air quality data</p>
        </div>
        
        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-grid">
              {sensors.map((sensor, index) => (
                <motion.div
                  key={sensor.id}
                  className="sensor-marker"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <div className="marker-icon">
                    <div 
                      className="marker-dot"
                      style={{ backgroundColor: getMarkerColor(sensor.aqi) }}
                    />
                  </div>
                  <div className="marker-info">
                    <h4 className="marker-name">{sensor.name}</h4>
                    <p className="marker-location">{sensor.location}</p>
                    <div className="marker-aqi">
                      <span className="aqi-value" style={{ color: getMarkerColor(sensor.aqi) }}>
                        AQI: {sensor.aqi}
                      </span>
                      <span className="aqi-status">{getAQIStatus(sensor.aqi)}</span>
                    </div>
                    <div className="sensor-details">
                      <span>PM2.5: {sensor.pm25.toFixed(1)} µg/m³</span>
                      <span>Temp: {sensor.temperature.toFixed(1)}°C</span>
                      <span>Humidity: {sensor.humidity.toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="map-note">
              🗺️ Interactive map with real-time sensor data
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponent;

  return (
    <motion.div 
      className="sensor-map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="map-header">
        <h1 className="map-title">Interactive Sensor Map</h1>
        <p className="map-subtitle">Click on markers to view detailed sensor data</p>
      </div>
      
      <div className="map-container">
        <div className="leaflet-container">
          <MapContainer
            center={[43.6532, -79.3832]}
            zoom={10}
            style={{ height: '500px', width: '100%', borderRadius: '12px' }}
            className="interactive-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {sensors.map((sensor) => (
              <Marker
                key={sensor.id}
                position={sensor.coordinates}
                icon={new window.L.Icon({
                  iconUrl: `data:image/svg+xml;base64,${btoa(`
                    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                      <path fill="${getMarkerColor(sensor.aqi)}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
                    </svg>
                  `)}`,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [0, -41]
                })}
              >
                <Popup>
                  <div className="popup-content">
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{sensor.name}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '14px' }}>{sensor.location}</p>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backgroundColor: getMarkerColor(sensor.aqi),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        AQI: {sensor.aqi} - {getAQIStatus(sensor.aqi)}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>PM2.5:</strong> {sensor.pm25.toFixed(1)} µg/m³
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>PM10:</strong> {sensor.pm10.toFixed(1)} µg/m³
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Temperature:</strong> {sensor.temperature.toFixed(1)}°C
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Humidity:</strong> {sensor.humidity.toFixed(1)}%
                      </div>
                      <div>
                        <strong>CO2:</strong> {sensor.co2.toFixed(0)} ppm
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '4px 8px', 
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#374151'
                    }}>
                      Status: {sensor.status} • Updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="map-legend">
          <h4>Air Quality Index (AQI)</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
              <span>Good (0-50)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
              <span>Moderate (51-100)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
              <span>Unhealthy for Sensitive Groups (101-150)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
              <span>Unhealthy (151+)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;
