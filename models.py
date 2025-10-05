from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class AlertSeverity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class AlertType(str, Enum):
    HIGH_PM25 = "high_pm25"
    HIGH_PM10 = "high_pm10"
    HIGH_CO2 = "high_co2"
    TEMPERATURE_EXTREME = "temperature_extreme"
    HUMIDITY_EXTREME = "humidity_extreme"
    SENSOR_OFFLINE = "sensor_offline"

class SensorStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"

class AirQualityData(BaseModel):
    id: Optional[int] = None
    sensor_id: str
    pm25: float
    pm10: float
    co2: float
    temperature: float
    humidity: float
    aqi: int
    location: str
    timestamp: datetime
    created_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SensorData(BaseModel):
    id: str
    name: str
    location: str
    latitude: float
    longitude: float
    status: SensorStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class User(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Alert(BaseModel):
    id: Optional[int] = None
    sensor_id: str
    alert_type: AlertType
    message: str
    severity: AlertSeverity
    threshold: float
    active: bool = True
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

class AirQualityIndex(BaseModel):
    """Calculate Air Quality Index based on PM2.5"""
    pm25: float
    aqi: int
    category: str
    health_impact: str
    recommendations: List[str]

    @classmethod
    def calculate_aqi(cls, pm25: float) -> 'AirQualityIndex':
        """Calculate AQI from PM2.5 value"""
        if pm25 <= 12.0:
            aqi = int((pm25 / 12.0) * 50)
            category = "Good"
            health_impact = "Air quality is considered satisfactory"
            recommendations = ["Enjoy outdoor activities", "Open windows for ventilation"]
        elif pm25 <= 35.4:
            aqi = int(50 + ((pm25 - 12.1) / 23.3) * 50)
            category = "Moderate"
            health_impact = "Sensitive groups may experience minor breathing discomfort"
            recommendations = ["Consider reducing outdoor activities if you have respiratory issues"]
        elif pm25 <= 55.4:
            aqi = int(100 + ((pm25 - 35.5) / 19.9) * 50)
            category = "Unhealthy for Sensitive Groups"
            health_impact = "Children, elderly, and those with respiratory issues should limit outdoor activities"
            recommendations = ["Reduce outdoor activities", "Close windows", "Use air purifiers"]
        elif pm25 <= 150.4:
            aqi = int(150 + ((pm25 - 55.5) / 94.9) * 100)
            category = "Unhealthy"
            health_impact = "Everyone may experience health effects"
            recommendations = ["Avoid outdoor activities", "Stay indoors", "Use N95 masks if going outside"]
        elif pm25 <= 250.4:
            aqi = int(200 + ((pm25 - 150.5) / 99.9) * 100)
            category = "Very Unhealthy"
            health_impact = "Health warnings of emergency conditions"
            recommendations = ["Stay indoors", "Use air purifiers", "Avoid all outdoor activities"]
        else:
            aqi = int(300 + ((pm25 - 250.5) / 149.5) * 100)
            category = "Hazardous"
            health_impact = "Health alert: everyone may experience more serious health effects"
            recommendations = ["Stay indoors", "Use high-efficiency air purifiers", "Consider evacuating if possible"]

        return cls(
            pm25=pm25,
            aqi=min(aqi, 500),  # Cap at 500
            category=category,
            health_impact=health_impact,
            recommendations=recommendations
        )

class WeatherData(BaseModel):
    """Weather data that affects air quality"""
    temperature: float
    humidity: float
    wind_speed: float
    wind_direction: int
    pressure: float
    uv_index: int
    timestamp: datetime

class LocationData(BaseModel):
    """Geographic location data"""
    latitude: float
    longitude: float
    city: str
    country: str
    timezone: str
    elevation: Optional[float] = None
