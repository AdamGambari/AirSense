from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import asyncio
from datetime import datetime, timedelta
import os
from typing import List, Dict, Optional
from pydantic import BaseModel
import uvicorn

# Import our modules
from database import get_supabase_client
from models import AirQualityData, SensorData, User, Alert
from mqtt_client import MQTTClient
from websocket_manager import ConnectionManager

# Helper function to update sensor data
def update_sensor_data(data):
    """Update sensor data and broadcast to WebSocket clients"""
    sensor_data[data['sensor_id']] = data
    asyncio.create_task(websocket_manager.broadcast_sensor_data(sensor_data))

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
        # Startup
        try:
            await mqtt_client.connect()
            print("AirSense API started")
        except:
            print("Using mock data generator")
            await mock_generator.start()
        yield
        # Shutdown
        try:
            await mqtt_client.disconnect()
        except:
            mock_generator.stop()
        print("AirSense API shutdown")

# Initialize FastAPI app
app = FastAPI(
    title="AirSense API",
    description="Real-time Air Quality Monitoring System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
websocket_manager = ConnectionManager()
mqtt_client = MQTTClient()

# Mock data generator for development
from mqtt_client import MockMQTTDataGenerator
mock_generator = MockMQTTDataGenerator(lambda data: update_sensor_data(data))

# Data models
class AirQualityResponse(BaseModel):
    pm25: float
    pm10: float
    co2: float
    temperature: float
    humidity: float
    timestamp: datetime
    location: str
    aqi: int

class AlertRequest(BaseModel):
    sensor_id: str
    threshold: float
    alert_type: str

# Store active connections and sensor data
active_connections: List[WebSocket] = []
sensor_data: Dict[str, AirQualityResponse] = {}

# Event handlers moved to lifespan context manager above

@app.get("/")
async def read_root():
    """Health check endpoint"""
    return {
        "message": "AirSense API is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "uptime": "running",
        "sensors_connected": len(sensor_data),
        "active_connections": len(active_connections)
    }

@app.get("/api/sensors")
async def get_sensors():
    """Get all available sensors"""
    return {
        "sensors": [
            {
                "id": "sensor_001",
                "name": "Downtown Station",
                "location": "Toronto, ON",
                "coordinates": [43.6532, -79.3832],
                "status": "online"
            },
            {
                "id": "sensor_002", 
                "name": "Suburban Station",
                "location": "Mississauga, ON",
                "coordinates": [43.5890, -79.6441],
                "status": "online"
            },
            {
                "id": "sensor_003",
                "name": "Industrial Zone",
                "location": "Hamilton, ON", 
                "coordinates": [43.2557, -79.8711],
                "status": "offline"
            }
        ]
    }

@app.get("/api/data/latest")
async def get_latest_data():
    """Get latest air quality data from all sensors"""
    if not sensor_data:
        # Return mock data if no real data
        return {
            "sensors": {
                "sensor_001": {
                    "pm25": 15.2,
                    "pm10": 28.5,
                    "co2": 420,
                    "temperature": 22.5,
                    "humidity": 65.0,
                    "aqi": 45,
                    "timestamp": datetime.now().isoformat(),
                    "location": "Downtown Station"
                },
                "sensor_002": {
                    "pm25": 12.8,
                    "pm10": 24.1,
                    "co2": 410,
                    "temperature": 21.8,
                    "humidity": 68.0,
                    "aqi": 38,
                    "timestamp": datetime.now().isoformat(),
                    "location": "Suburban Station"
                }
            }
        }
    return {"sensors": sensor_data}

@app.get("/api/data/historical")
async def get_historical_data(sensor_id: str, hours: int = 24):
    """Get historical air quality data"""
    # Mock historical data
    now = datetime.now()
    historical_data = []
    
    for i in range(hours):
        timestamp = now - timedelta(hours=i)
        historical_data.append({
            "timestamp": timestamp.isoformat(),
            "pm25": 10 + (i % 10),
            "pm10": 20 + (i % 15),
            "co2": 400 + (i % 50),
            "temperature": 20 + (i % 8),
            "humidity": 60 + (i % 20),
            "aqi": 30 + (i % 30)
        })
    
    return {
        "sensor_id": sensor_id,
        "data": list(reversed(historical_data))
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time data"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Send latest sensor data every 5 seconds
            await asyncio.sleep(5)
            if sensor_data:
                await websocket_manager.broadcast(json.dumps({
                    "type": "sensor_data",
                    "data": sensor_data
                }))
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

@app.post("/api/alerts")
async def create_alert(alert: AlertRequest):
    """Create a new air quality alert"""
    # Store alert in database
    return {
        "message": "Alert created successfully",
        "alert_id": f"alert_{datetime.now().timestamp()}"
    }

@app.get("/api/alerts")
async def get_alerts():
    """Get all active alerts"""
    return {
        "alerts": [
            {
                "id": "alert_001",
                "sensor_id": "sensor_001",
                "type": "high_pm25",
                "message": "PM2.5 levels above 25 μg/m³",
                "severity": "moderate",
                "timestamp": datetime.now().isoformat(),
                "active": True
            }
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
