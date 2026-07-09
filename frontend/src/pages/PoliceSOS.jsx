import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PoliceSOS = () => {
  const [sosEmergencies, setSosEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSOS = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      const sosData = response.data.filter(e => e.reportType === 'dispatcher');
      setSosEmergencies(sosData);
    } catch (error) {
      console.error('Error fetching SOS:', error);
      setSosEmergencies([
        {
          id: 'ER1002',
          complaintId: 'ER260709-489487',
          emergencyType: 'Fire',
          description: 'Building fire with smoke, people trapped',
          status: 'Pending',
          name: 'Priya Patel',
          phone: '+919876543211',
          timestamp: new Date().toISOString(),
          priority: 'Critical',
          reportType: 'dispatcher',
          dispatcherName: 'Priya Patel',
          dispatcherPhone: '+919876543211',
          bloodGroup: 'B+'
        }
      ]);
    } finally {
      setLoading(false);
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

  const getEmergencyIcon = (type) => {
    const icons = {
      'Accident': '🚗',
      'Fire': '🔥',
      'Crime': '🚨',
      'Medical': '🩺',
      'Other': '📌'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🆘 SOS Alerts</h1>
            <p className="text-gray-600 text-sm">Emergency alerts from dispatchers</p>
          </div>
          <button onClick={fetchSOS} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center gap-2">
            🔄 Refresh
          </button>
        </div>

        {/* SOS Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-red-50 rounded-lg shadow p-3 border border-red-200">
            <p className="text-xs text-red-600">Total SOS Alerts</p>
            <p className="text-xl font-bold text-red-600">{sosEmergencies.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-3 border border-yellow-200">
            <p className="text-xs text-yellow-600">Pending</p>
            <p className="text-xl font-bold text-yellow-600">
              {sosEmergencies.filter(e => e.status === 'Pending' || e.status === 'Assigned').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-3 border border-green-200">
            <p className="text-xs text-green-600">Resolved</p>
            <p className="text-xl font-bold text-green-600">
              {sosEmergencies.filter(e => e.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* SOS List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-md font-semibold text-red-600">🆘 SOS Emergency Alerts</h2>
            <span className="text-xs text-gray-500">{sosEmergencies.length} alerts</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : sosEmergencies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <span className="text-4xl block mb-2">✅</span>
                <p>No SOS alerts</p>
              </div>
            ) : (
              sosEmergencies.map((case_) => (
                <div key={case_.id} className="p-4 hover:bg-red-50 transition border-l-4 border-red-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-2xl">🆘</span>
                        <span className="text-xl">{getEmergencyIcon(case_.emergencyType)}</span>
                        <span className="font-semibold">#{case_.complaintId || case_.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                          🔴 CRITICAL
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1">{case_.emergencyType}</p>
                      <p className="text-sm text-gray-600">{case_.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span>👤 {case_.dispatcherName || case_.name}</span>
                        <span>📱 {case_.dispatcherPhone || case_.phone}</span>
                        {case_.bloodGroup && <span>🩸 {case_.bloodGroup}</span>}
                        <span>🕐 {new Date(case_.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link 
                        to={`/track/${case_.complaintId || case_.id}`} 
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition text-center"
                      >
                        🚨 View
                      </Link>
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

export default PoliceSOS;