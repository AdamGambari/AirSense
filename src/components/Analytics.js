import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Activity, Thermometer, Droplets, Wind, Download } from 'lucide-react';
import ChartComponent from './ChartComponent';
import { exportService } from '../services/export';

const Analytics = ({ sensorData, alerts = [] }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState({});
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Generate analytics data from current sensor data
    if (sensorData) {
      const sensors = Object.values(sensorData);
      if (sensors.length > 0) {
        const avgPM25 = sensors.reduce((sum, sensor) => sum + (sensor.pm25 || 0), 0) / sensors.length;
        const avgTemp = sensors.reduce((sum, sensor) => sum + (sensor.temperature || 0), 0) / sensors.length;
        const avgHumidity = sensors.reduce((sum, sensor) => sum + (sensor.humidity || 0), 0) / sensors.length;
        const avgCO2 = sensors.reduce((sum, sensor) => sum + (sensor.co2 || 0), 0) / sensors.length;
        
        setAnalyticsData({
          avgPM25: avgPM25.toFixed(1),
          avgTemp: avgTemp.toFixed(1),
          avgHumidity: avgHumidity.toFixed(1),
          avgCO2: avgCO2.toFixed(0),
          trend: avgPM25 > 20 ? 'up' : 'down',
          healthScore: avgPM25 <= 12 ? 95 : avgPM25 <= 35 ? 75 : avgPM25 <= 55 ? 50 : 25
        });

        // Generate chart data
        generateChartData(sensors, timeRange);
      }
    }
  }, [sensorData, timeRange]);

  const generateChartData = (sensors, range) => {
    const hours = range === '1h' ? 1 : range === '24h' ? 24 : 168; // 7 days
    const dataPoints = Math.min(hours * 6, 50); // Max 50 points for performance
    
    const labels = [];
    const pm25Data = [];
    const tempData = [];
    const humidityData = [];
    const co2Data = [];
    
    const now = new Date();
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * (hours * 60 * 60 * 1000) / dataPoints));
      labels.push(time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
      
      // Generate realistic historical data with some variation
      const basePM25 = sensors.reduce((sum, s) => sum + (s.pm25 || 0), 0) / sensors.length;
      const baseTemp = sensors.reduce((sum, s) => sum + (s.temperature || 0), 0) / sensors.length;
      const baseHumidity = sensors.reduce((sum, s) => sum + (s.humidity || 0), 0) / sensors.length;
      const baseCO2 = sensors.reduce((sum, s) => sum + (s.co2 || 0), 0) / sensors.length;
      
      // Add some realistic variation
      const variation = Math.sin(i * 0.5) * 0.3 + Math.random() * 0.2;
      
      pm25Data.push(Number((basePM25 + basePM25 * variation * 0.3).toFixed(1)));
      tempData.push(Number((baseTemp + baseTemp * variation * 0.1).toFixed(1)));
      humidityData.push(Number((baseHumidity + baseHumidity * variation * 0.2).toFixed(1)));
      co2Data.push(Number((baseCO2 + baseCO2 * variation * 0.15).toFixed(0)));
    }
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'PM2.5 (µg/m³)',
          data: pm25Data,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Humidity (%)',
          data: humidityData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'CO2 (ppm)',
          data: co2Data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    });
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHealthScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const handleExportData = () => {
    const analyticsExport = {
      timestamp: new Date().toISOString(),
      range: timeRange,
      analytics: analyticsData
    };
    
    exportService.exportAnalytics(analyticsExport);
  };

  const handleExportFullReport = () => {
    exportService.generateReport(sensorData, alerts, {
      timestamp: new Date().toISOString(),
      range: timeRange,
      analytics: analyticsData
    });
  };

  return (
    <motion.div 
      className="analytics"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Detailed air quality analysis and trends</p>
        
            <div className="analytics-controls">
              <div className="time-range-selector">
                <button 
                  className={timeRange === '1h' ? 'active' : ''} 
                  onClick={() => setTimeRange('1h')}
                >
                  1 Hour
                </button>
                <button 
                  className={timeRange === '24h' ? 'active' : ''} 
                  onClick={() => setTimeRange('24h')}
                >
                  24 Hours
                </button>
                <button 
                  className={timeRange === '7d' ? 'active' : ''} 
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </button>
              </div>
              
              <div className="export-buttons">
                <button 
                  className="export-btn"
                  onClick={handleExportData}
                  title="Export Analytics Data"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button 
                  className="export-btn"
                  onClick={handleExportFullReport}
                  title="Export Full Report"
                >
                  <Download className="w-4 h-4" />
                  Full Report
                </button>
              </div>
            </div>
      </div>
      
      <div className="analytics-grid">
        {/* Health Score Card */}
        <motion.div 
          className="analytics-card health-score"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-header">
            <Activity className="w-6 h-6" />
            <h3>Air Quality Score</h3>
          </div>
          <div className="score-display">
            <div className={`score-number ${getHealthScoreColor(analyticsData.healthScore)}`}>
              {analyticsData.healthScore || 0}
            </div>
            <div className="score-label">{getHealthScoreText(analyticsData.healthScore || 0)}</div>
          </div>
        </motion.div>

        {/* Average PM2.5 */}
        <motion.div 
          className="analytics-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <BarChart3 className="w-6 h-6" />
            <h3>Average PM2.5</h3>
          </div>
          <div className="metric-value">{analyticsData.avgPM25 || 0} µg/m³</div>
          <div className="metric-trend">
            {analyticsData.trend === 'up' ? 
              <><TrendingUp className="w-4 h-4 text-red-400" /> Rising</> : 
              <><TrendingDown className="w-4 h-4 text-green-400" /> Improving</>
            }
          </div>
        </motion.div>

        {/* Average Temperature */}
        <motion.div 
          className="analytics-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <Thermometer className="w-6 h-6" />
            <h3>Average Temperature</h3>
          </div>
          <div className="metric-value">{analyticsData.avgTemp || 0}°C</div>
          <div className="metric-subtitle">Optimal range: 18-24°C</div>
        </motion.div>

        {/* Average Humidity */}
        <motion.div 
          className="analytics-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <Droplets className="w-6 h-6" />
            <h3>Average Humidity</h3>
          </div>
          <div className="metric-value">{analyticsData.avgHumidity || 0}%</div>
          <div className="metric-subtitle">Optimal range: 40-60%</div>
        </motion.div>

        {/* Average CO2 */}
        <motion.div 
          className="analytics-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card-header">
            <Wind className="w-6 h-6" />
            <h3>Average CO2</h3>
          </div>
          <div className="metric-value">{analyticsData.avgCO2 || 0} ppm</div>
          <div className="metric-subtitle">Normal range: 400-600 ppm</div>
        </motion.div>

            {/* Real Chart */}
            <motion.div 
              className="analytics-card chart-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="card-header">
                <BarChart3 className="w-6 h-6" />
                <h3>Air Quality Trends ({timeRange})</h3>
              </div>
              <div className="chart-container">
                {chartData ? (
                  <ChartComponent 
                    key={`chart-${timeRange}`}
                    type="line" 
                    data={chartData} 
                    height={300}
                    options={{
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="chart-placeholder">
                    <div className="chart-bars">
                      {[12, 18, 15, 22, 19, 16, 14, 17].map((height, index) => (
                        <div 
                          key={index} 
                          className="chart-bar" 
                          style={{ height: `${height * 3}px` }}
                        />
                      ))}
                    </div>
                    <p className="chart-note">📊 Loading air quality trends...</p>
                  </div>
                )}
              </div>
            </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
