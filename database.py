import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hbthfbdpxbmhbeizbqia.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidGhmYmRweGJtaGJlaXpicWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTg1MTgsImV4cCI6MjA3NTE5NDUxOH0.z_T6iBs1taUKaK4QxLKQA3lcAPiEEkOQA_2B6r86_aw")

# Initialize Supabase client (optional)
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase client initialized successfully")
except Exception as e:
    print(f"⚠️ Supabase client initialization failed: {e}")
    print("📝 Running in offline mode - data will not be persisted to database")
    supabase = None

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    return supabase

# Database schema for AirSense
AIR_QUALITY_TABLE = """
CREATE TABLE IF NOT EXISTS air_quality_data (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    pm25 FLOAT NOT NULL,
    pm10 FLOAT NOT NULL,
    co2 FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    aqi INTEGER NOT NULL,
    location VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'online',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    threshold FLOAT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

def initialize_database():
    """Initialize database tables"""
    if not supabase:
        print("⚠️ Database not available - skipping initialization")
        return False
    try:
        # Execute schema creation
        result = supabase.rpc('exec_sql', {'sql': AIR_QUALITY_TABLE})
        print("✅ Database tables initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def insert_air_quality_data(sensor_id: str, pm25: float, pm10: float, co2: float, 
                           temperature: float, humidity: float, aqi: int, location: str):
    """Insert new air quality data"""
    if not supabase:
        print("⚠️ Database not available - data not persisted")
        return None
    try:
        data = {
            "sensor_id": sensor_id,
            "pm25": pm25,
            "pm10": pm10,
            "co2": co2,
            "temperature": temperature,
            "humidity": humidity,
            "aqi": aqi,
            "location": location
        }
        
        result = supabase.table("air_quality_data").insert(data).execute()
        return result.data
    except Exception as e:
        print(f"❌ Failed to insert air quality data: {e}")
        return None

def get_latest_air_quality(sensor_id: str = None):
    """Get latest air quality data"""
    if not supabase:
        return []
    try:
        query = supabase.table("air_quality_data").select("*").order("timestamp", desc=True).limit(1)
        
        if sensor_id:
            query = query.eq("sensor_id", sensor_id)
            
        result = query.execute()
        return result.data
    except Exception as e:
        print(f"❌ Failed to get air quality data: {e}")
        return []

def get_historical_air_quality(sensor_id: str, hours: int = 24):
    """Get historical air quality data"""
    if not supabase:
        return []
    try:
        from datetime import datetime, timedelta
        
        start_time = datetime.now() - timedelta(hours=hours)
        
        result = supabase.table("air_quality_data")\
            .select("*")\
            .eq("sensor_id", sensor_id)\
            .gte("timestamp", start_time.isoformat())\
            .order("timestamp", desc=False)\
            .execute()
            
        return result.data
    except Exception as e:
        print(f"❌ Failed to get historical data: {e}")
        return []
