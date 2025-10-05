import { notificationService } from './notifications';

class ExportService {
  exportToCSV(data, filename = 'airsense-data') {
    try {
      // Convert data to CSV format
      const csvContent = this.convertToCSV(data);
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        notificationService.showSystemNotification(
          'Export Successful',
          `Data exported to ${filename}.csv`
        );
        
        return true;
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      notificationService.showSystemNotification(
        'Export Failed',
        'Failed to export data to CSV'
      );
      return false;
    }
  }

  exportToJSON(data, filename = 'airsense-data') {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        notificationService.showSystemNotification(
          'Export Successful',
          `Data exported to ${filename}.json`
        );
        
        return true;
      }
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      notificationService.showSystemNotification(
        'Export Failed',
        'Failed to export data to JSON'
      );
      return false;
    }
  }

  convertToCSV(data) {
    if (!data || !Array.isArray(data)) {
      return 'No data available';
    }

    if (data.length === 0) {
      return 'No data available';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const csvHeader = headers.join(',');
    
    // Create CSV data rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [csvHeader, ...csvRows].join('\n');
  }

  exportSensorData(sensorData) {
    const exportData = Object.entries(sensorData).map(([sensorId, data]) => ({
      sensor_id: sensorId,
      location: data.location || 'Unknown',
      timestamp: data.timestamp || new Date().toISOString(),
      pm25: data.pm25 || 0,
      pm10: data.pm10 || 0,
      co2: data.co2 || 0,
      temperature: data.temperature || 0,
      humidity: data.humidity || 0,
      pressure: data.pressure || 0,
      aqi: data.aqi || 0,
      health_status: data.health_status || 'Unknown'
    }));

    return this.exportToCSV(exportData, 'sensor-data');
  }

  exportAlerts(alerts) {
    const exportData = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      sensor_id: alert.sensor,
      location: alert.location,
      timestamp: alert.timestamp,
      value: alert.value || '',
      threshold: alert.threshold || ''
    }));

    return this.exportToCSV(exportData, 'alerts');
  }

  exportAnalytics(analyticsData) {
    const exportData = [{
      timestamp: analyticsData.timestamp || new Date().toISOString(),
      range: analyticsData.range || '24h',
      avg_pm25: analyticsData.analytics?.avg_pm25 || 0,
      avg_temperature: analyticsData.analytics?.avg_temperature || 0,
      avg_humidity: analyticsData.analytics?.avg_humidity || 0,
      avg_co2: analyticsData.analytics?.avg_co2 || 0,
      health_score: analyticsData.analytics?.health_score || 0,
      trend: analyticsData.analytics?.trend || 'unknown'
    }];

    return this.exportToCSV(exportData, 'analytics');
  }

  generateReport(sensorData, alerts, analytics) {
    const report = {
      generated_at: new Date().toISOString(),
      summary: {
        total_sensors: Object.keys(sensorData).length,
        total_alerts: alerts.length,
        avg_health_score: analytics?.analytics?.health_score || 0,
        air_quality_trend: analytics?.analytics?.trend || 'unknown'
      },
      sensor_data: sensorData,
      alerts: alerts,
      analytics: analytics,
      metadata: {
        report_version: '1.0',
        generated_by: 'AirSense Dashboard'
      }
    };

    return this.exportToJSON(report, 'airsense-report');
  }
}

// Create singleton instance
export const exportService = new ExportService();

export default exportService;
