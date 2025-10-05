class NotificationService {
  constructor() {
    this.permission = null;
    this.isSupported = 'Notification' in window;
    this.requestPermission();
  }

  async requestPermission() {
    if (!this.isSupported) {
      console.warn('Browser does not support notifications');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  showAlert(alert) {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    const options = {
      body: alert.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: alert.id, // Prevent duplicate notifications
      requireInteraction: alert.severity === 'high',
      silent: alert.severity === 'low',
      data: {
        alertId: alert.id,
        sensorId: alert.sensor,
        timestamp: alert.timestamp
      }
    };

    // Add action buttons for high severity alerts
    if (alert.severity === 'high') {
      options.actions = [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ];
    }

    try {
      const notification = new Notification(alert.title, options);
      
      // Auto-close after 10 seconds for non-critical alerts
      if (alert.severity !== 'high') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Could emit an event to navigate to alerts page
        window.dispatchEvent(new CustomEvent('notification-clicked', {
          detail: { alert }
        }));
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  showSystemNotification(title, message, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      return;
    }

    const defaultOptions = {
      body: message,
      icon: '/favicon.ico',
      tag: `system-${Date.now()}`,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing system notification:', error);
      return null;
    }
  }

  clearAll() {
    console.log('Cannot clear all notifications programmatically');
  }

  isPermissionGranted() {
    return this.permission === 'granted';
  }

  getPermissionStatus() {
    return this.permission;
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

export default notificationService;
