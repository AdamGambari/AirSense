import paho.mqtt.client as mqtt
import json
import asyncio
from datetime import datetime
from typing import Callable, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MQTTClient:
    """MQTT client for receiving sensor data from IoT devices"""
    
    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = None
        self.connected = False
        self.data_callback: Optional[Callable] = None
        
        # MQTT topics for different sensor types
        self.topics = {
            "air_quality": "airsense/sensors/+/air_quality",
            "temperature": "airsense/sensors/+/temperature", 
            "humidity": "airsense/sensors/+/humidity",
            "status": "airsense/sensors/+/status"
        }
    
    def set_data_callback(self, callback: Callable):
        """Set callback function for received data"""
        self.data_callback = callback
    
    def on_connect(self, client, userdata, flags, rc):
        """Callback for when MQTT client connects"""
        if rc == 0:
            self.connected = True
            logger.info("🔗 MQTT client connected successfully")
            
            # Subscribe to all sensor topics
            for topic_name, topic_pattern in self.topics.items():
                client.subscribe(topic_pattern)
                logger.info(f"📡 Subscribed to topic: {topic_pattern}")
        else:
            logger.error(f"❌ MQTT connection failed with code {rc}")
    
    def on_disconnect(self, client, userdata, rc):
        """Callback for when MQTT client disconnects"""
        self.connected = False
        logger.info("🔌 MQTT client disconnected")
    
    def on_message(self, client, userdata, msg):
        """Callback for when MQTT message is received"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            # Extract sensor ID from topic (format: airsense/sensors/{sensor_id}/data_type)
            topic_parts = topic.split('/')
            if len(topic_parts) >= 3:
                sensor_id = topic_parts[2]
                
                # Add sensor ID and timestamp to payload
                payload['sensor_id'] = sensor_id
                payload['timestamp'] = datetime.now().isoformat()
                payload['topic'] = topic
                
                logger.info(f"📊 Received data from sensor {sensor_id}: {payload}")
                
                # Call the data callback if set
                if self.data_callback:
                    self.data_callback(payload)
                    
        except json.JSONDecodeError as e:
            logger.error(f"❌ Failed to decode MQTT message: {e}")
        except Exception as e:
            logger.error(f"❌ Error processing MQTT message: {e}")
    
    async def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client = mqtt.Client()
            self.client.on_connect = self.on_connect
            self.client.on_disconnect = self.on_disconnect
            self.client.on_message = self.on_message
            
            # Connect to broker
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            
            # Wait a moment for connection to establish
            await asyncio.sleep(1)
            
            if self.connected:
                logger.info("✅ MQTT client started successfully")
            else:
                logger.warning("⚠️ MQTT client started but not connected (broker may be offline)")
                
        except Exception as e:
            logger.error(f"❌ Failed to start MQTT client: {e}")
    
    async def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("🔌 MQTT client disconnected")
    
    def publish_sensor_command(self, sensor_id: str, command: str, payload: dict = None):
        """Publish command to specific sensor"""
        if not self.connected:
            logger.warning("⚠️ Cannot publish command: MQTT not connected")
            return
            
        topic = f"airsense/sensors/{sensor_id}/commands"
        message = {
            "command": command,
            "timestamp": datetime.now().isoformat()
        }
        
        if payload:
            message.update(payload)
        
        try:
            self.client.publish(topic, json.dumps(message))
            logger.info(f"📤 Published command to sensor {sensor_id}: {command}")
        except Exception as e:
            logger.error(f"❌ Failed to publish command: {e}")
    
    def get_connection_status(self) -> dict:
        """Get MQTT connection status"""
        return {
            "connected": self.connected,
            "broker_host": self.broker_host,
            "broker_port": self.broker_port,
            "subscribed_topics": list(self.topics.values())
        }

# Mock MQTT data generator for testing
class MockMQTTDataGenerator:
    """Generate mock sensor data for testing when real MQTT broker is not available"""
    
    def __init__(self, callback: Callable):
        self.callback = callback
        self.running = False
        self.sensors = [
            {"id": "sensor_001", "location": "Downtown Station", "lat": 43.6532, "lon": -79.3832},
            {"id": "sensor_002", "location": "Suburban Station", "lat": 43.5890, "lon": -79.6441},
            {"id": "sensor_003", "location": "Industrial Zone", "lat": 43.2557, "lon": -79.8711}
        ]
    
    async def start(self):
        """Start generating mock data"""
        self.running = True
        logger.info("🎭 Starting mock MQTT data generator")
        
        while self.running:
            for sensor in self.sensors:
                # Generate realistic air quality data with more variation
                base_time = datetime.now().timestamp()
                sensor_offset = hash(sensor["id"]) % 100
                
                # More realistic PM2.5 values (5-35 µg/m³ range)
                pm25 = round(8 + (base_time + sensor_offset) % 25 + (base_time % 10) * 0.5, 1)
                
                # PM10 is typically 1.5-2x PM2.5
                pm10 = round(pm25 * 1.7 + (base_time % 5), 1)
                
                # CO2 levels (400-600 ppm normal range)
                co2 = round(420 + (base_time + sensor_offset) % 150 + (base_time % 20), 0)
                
                # Temperature varies by location and time
                if "Downtown" in sensor["location"]:
                    temp = round(22 + (base_time % 8) - 4 + (base_time % 3), 1)  # 18-26°C
                else:
                    temp = round(20 + (base_time % 6) - 3 + (base_time % 2), 1)  # 17-23°C
                
                # Humidity (40-80% range)
                humidity = round(55 + (base_time + sensor_offset) % 25 + (base_time % 7), 1)
                
                mock_data = {
                    "sensor_id": sensor["id"],
                    "location": sensor["location"],
                    "pm25": pm25,
                    "pm10": pm10,
                    "co2": co2,
                    "temperature": temp,
                    "humidity": humidity,
                    "pressure": round(1013 + (base_time % 20) - 10, 1),  # 1003-1033 hPa
                    "timestamp": datetime.now().isoformat()
                }
                
                # Calculate AQI
                aqi = self.calculate_aqi(mock_data["pm25"])
                mock_data["aqi"] = aqi
                
                # Send to callback
                self.callback(mock_data)
                
                # Small delay between sensors
                await asyncio.sleep(0.5)
            
            # Wait before next round
            await asyncio.sleep(10)  # Generate new data every 10 seconds
    
    def stop(self):
        """Stop generating mock data"""
        self.running = False
        logger.info("🛑 Mock MQTT data generator stopped")
    
    def calculate_aqi(self, pm25: float) -> int:
        """Calculate AQI from PM2.5"""
        if pm25 <= 12.0:
            return int((pm25 / 12.0) * 50)
        elif pm25 <= 35.4:
            return int(50 + ((pm25 - 12.1) / 23.3) * 50)
        elif pm25 <= 55.4:
            return int(100 + ((pm25 - 35.5) / 19.9) * 50)
        else:
            return int(150 + ((pm25 - 55.5) / 94.9) * 100)
