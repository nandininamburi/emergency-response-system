import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const PoliceLiveMap = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      setEmergencies(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      // Demo data
      setEmergencies([
        {
          id: 'ER1001',
          emergencyType: 'Road Accident',
          description: 'Car collided with bike',
          status: 'Pending',
          name: 'Rahul Sharma',
          latitude: 12.9716,
          longitude: 77.5946,
          priority: 'High'
        },
        {
          id: 'ER1002',
          emergencyType: 'Fire',
          description: 'Building fire with smoke',
          status: 'Assigned',
          name: 'Priya Patel',
          latitude: 12.9812,
          longitude: 77.7200,
          priority: 'Critical'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📍 Live Map</h1>
            <p className="text-gray-600 text-sm">Real-time tracking of all emergencies</p>
          </div>
          <button onClick={fetchEmergencies} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            🔄 Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">All Emergencies</h2>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
            <MapComponent emergencies={emergencies} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">Total Emergencies</p>
            <p className="text-xl font-bold">{emergencies.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">🔴 Critical</p>
            <p className="text-xl font-bold text-red-600">{emergencies.filter(e => e.priority === 'Critical').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">🟡 High</p>
            <p className="text-xl font-bold text-orange-600">{emergencies.filter(e => e.priority === 'High').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">🟢 Low/Medium</p>
            <p className="text-xl font-bold text-green-600">{emergencies.filter(e => e.priority === 'Low' || e.priority === 'Medium').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceLiveMap;