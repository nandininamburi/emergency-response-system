import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DispatcherDashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    onRoute: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      setEmergencies(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      // Demo data
      const demoData = [
        {
          id: 'DEMO-001',
          emergencyType: 'Road Accident',
          description: 'Collision at main intersection',
          status: 'Pending',
          name: 'Rahul Sharma',
          phone: '9876543210',
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: new Date().toISOString(),
          priority: 'High'
        },
        {
          id: 'DEMO-002',
          emergencyType: 'Fire',
          description: 'Building fire with smoke',
          status: 'Assigned',
          name: 'Priya Patel',
          phone: '9876543211',
          latitude: 12.9812,
          longitude: 77.7200,
          timestamp: new Date().toISOString(),
          priority: 'Critical'
        },
        {
          id: 'DEMO-003',
          emergencyType: 'Medical',
          description: 'Person unconscious',
          status: 'On Route',
          name: 'Amit Kumar',
          phone: '9876543212',
          latitude: 12.9550,
          longitude: 77.7400,
          timestamp: new Date().toISOString(),
          priority: 'High'
        }
      ];
      setEmergencies(demoData);
      updateStats(demoData);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const pending = data.filter(e => e.status === 'Pending').length;
    const assigned = data.filter(e => e.status === 'Assigned').length;
    const onRoute = data.filter(e => e.status === 'On Route').length;
    const resolved = data.filter(e => e.status === 'Resolved').length;
    setStats({
      total: data.length,
      pending,
      assigned,
      onRoute,
      resolved
    });
  };

  const assignEmergency = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/emergencies/${id}`, {
        status: 'Assigned',
        assignedOfficer: 'Officer Kumar'
      });
      fetchEmergencies();
      alert(`✅ Case #${id} assigned to Officer Kumar`);
    } catch (error) {
      console.error('Error assigning emergency:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Assigned': 'bg-blue-100 text-blue-800',
      'On Route': 'bg-purple-100 text-purple-800',
      'Resolved': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading emergencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🖥️ Dispatcher Dashboard</h1>
            <p className="text-gray-600">Manage all emergency reports</p>
          </div>
          <button
            onClick={fetchEmergencies}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-2xl font-semibold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl">👮</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Assigned</p>
                <p className="text-2xl font-semibold">{stats.assigned}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full">
                <span className="text-purple-600 text-xl">🚗</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">On Route</p>
                <p className="text-2xl font-semibold">{stats.onRoute}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Resolved</p>
                <p className="text-2xl font-semibold">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">📍 Live Map - All Emergencies</h2>
          <div className="h-80 rounded-lg overflow-hidden">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {emergencies.map((emergency) => (
                <Marker
                  key={emergency.id}
                  position={[emergency.latitude || 12.9716, emergency.longitude || 77.5946]}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold">#{emergency.id}</h3>
                      <p className="text-sm">{emergency.emergencyType}</p>
                      <p className="text-xs text-gray-600">{emergency.description}</p>
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(emergency.priority)}`}>
                          {emergency.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">👤 {emergency.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Emergency List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">📋 All Emergency Reports</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {emergencies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No emergencies reported</div>
            ) : (
              emergencies.map((emergency) => (
                <div key={emergency.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">#{emergency.id}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(emergency.priority)}`}>
                          {emergency.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="font-medium">{emergency.emergencyType}</p>
                      <p className="text-sm text-gray-600">{emergency.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        👤 {emergency.name} • 📱 {emergency.phone} • 
                        📍 {emergency.latitude?.toFixed(4)}, {emergency.longitude?.toFixed(4)} • 
                        🕐 {new Date(emergency.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/track/${emergency.id}`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                      {emergency.status === 'Pending' && (
                        <button
                          onClick={() => assignEmergency(emergency.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          👮 Assign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;