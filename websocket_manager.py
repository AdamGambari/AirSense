from fastapi import WebSocket
from typing import List
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    """Manages WebSocket connections for real-time data broadcasting"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_data: dict = {}
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        connection_id = f"conn_{len(self.active_connections)}_{datetime.now().timestamp()}"
        self.connection_data[websocket] = {
            "id": connection_id,
            "connected_at": datetime.now(),
            "last_ping": datetime.now()
        }
        print(f"🔗 WebSocket connected: {connection_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to AirSense real-time data stream",
            "connection_id": connection_id
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            connection_info = self.connection_data.pop(websocket, {})
            print(f"🔌 WebSocket disconnected: {connection_info.get('id', 'unknown')}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message, default=str))
        except Exception as e:
            print(f"❌ Failed to send personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Broadcast message to all connected WebSockets"""
        if not self.active_connections:
            return
            
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"❌ Failed to broadcast to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_sensor_data(self, sensor_data: dict):
        """Broadcast sensor data to all connections"""
        message = {
            "type": "sensor_update",
            "timestamp": datetime.now().isoformat(),
            "data": sensor_data
        }
        await self.broadcast(json.dumps(message, default=str))
    
    async def broadcast_alert(self, alert: dict):
        """Broadcast alert to all connections"""
        message = {
            "type": "alert",
            "timestamp": datetime.now().isoformat(),
            "alert": alert
        }
        await self.broadcast(json.dumps(message, default=str))
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_connection_info(self) -> List[dict]:
        """Get information about all connections"""
        info = []
        for websocket, data in self.connection_data.items():
            info.append({
                "id": data["id"],
                "connected_at": data["connected_at"].isoformat(),
                "last_ping": data["last_ping"].isoformat()
            })
        return info
    
    async def ping_connections(self):
        """Send ping to all connections to check health"""
        message = {
            "type": "ping",
            "timestamp": datetime.now().isoformat()
        }
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message, default=str))
                if connection in self.connection_data:
                    self.connection_data[connection]["last_ping"] = datetime.now()
            except Exception as e:
                print(f"❌ Ping failed for connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
