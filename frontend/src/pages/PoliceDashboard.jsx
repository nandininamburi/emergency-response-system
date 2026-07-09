import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const PoliceDashboard = () => {
  const [allEmergencies, setAllEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    onRoute: 0,
    resolved: 0,
    sos: 0,
    citizen: 0
  });

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      setAllEmergencies(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      // Demo data
      const demoData = [
        {
          id: 'ER1001',
          complaintId: 'ER260709-489486',
          emergencyType: 'Road Accident',
          description: 'Car collided with bike at intersection, 2 injured',
          status: 'Pending',
          name: 'Rahul Sharma',
          phone: '+919876543210',
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: new Date().toISOString(),
          priority: 'High',
          bloodGroup: 'O+',
          address: 'MG Road, Bangalore',
          reportType: 'citizen'
        },
        {
          id: 'ER1002',
          complaintId: 'ER260709-489487',
          emergencyType: 'Fire',
          description: 'Building fire with smoke, people trapped on 3rd floor',
          status: 'Assigned',
          name: 'Priya Patel',
          phone: '+919876543211',
          latitude: 12.9812,
          longitude: 77.7200,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          priority: 'Critical',
          bloodGroup: 'B+',
          address: 'Indiranagar, Bangalore',
          reportType: 'dispatcher'
        },
        {
          id: 'ER1003',
          complaintId: 'ER260709-489488',
          emergencyType: 'Medical',
          description: 'Elderly person unconscious, needs immediate ambulance',
          status: 'On Route',
          name: 'Amit Kumar',
          phone: '+919876543212',
          latitude: 12.9550,
          longitude: 77.7400,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          priority: 'High',
          bloodGroup: 'A+',
          address: 'Koramangala, Bangalore',
          reportType: 'citizen'
        },
        {
          id: 'ER1004',
          complaintId: 'ER260709-489489',
          emergencyType: 'Crime',
          description: 'Theft reported at parking lot, CCTV footage available',
          status: 'Resolved',
          name: 'Sneha Reddy',
          phone: '+919876543213',
          latitude: 12.9650,
          longitude: 77.7100,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          priority: 'Medium',
          bloodGroup: 'AB+',
          address: 'Jayanagar, Bangalore',
          reportType: 'dispatcher'
        }
      ];
      setAllEmergencies(demoData);
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
    const sos = data.filter(e => e.reportType === 'dispatcher').length;
    const citizen = data.filter(e => e.reportType === 'citizen' || !e.reportType).length;
    setStats({
      total: data.length,
      pending,
      assigned,
      onRoute,
      resolved,
      sos,
      citizen
    });
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

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get recent cases (last 5)
  const recentCases = allEmergencies.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Overview</h1>
            <p className="text-gray-600 text-sm">Welcome back, Officer Kumar</p>
          </div>
          <button onClick={fetchEmergencies} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full"><span className="text-blue-600 text-xl">📋</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Total Cases</p><p className="text-2xl font-bold">{stats.total}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full"><span className="text-yellow-600 text-xl">⏳</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full"><span className="text-purple-600 text-xl">🚗</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">On Route</p><p className="text-2xl font-bold">{stats.onRoute}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full"><span className="text-green-600 text-xl">✅</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Resolved</p><p className="text-2xl font-bold">{stats.resolved}</p></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">Assigned Cases</p>
            <p className="text-xl font-bold text-blue-600">{stats.assigned}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">🆘 SOS Alerts</p>
            <p className="text-xl font-bold text-red-600">{stats.sos}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">👤 Citizen Reports</p>
            <p className="text-xl font-bold text-green-600">{stats.citizen}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Link to="/police/map" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition">
            <span className="text-2xl block">📍</span>
            <span className="text-sm font-medium">Live Map</span>
          </Link>
          <Link to="/police/reports" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition">
            <span className="text-2xl block">📋</span>
            <span className="text-sm font-medium">All Reports</span>
          </Link>
          <Link to="/police/cases" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition">
            <span className="text-2xl block">👮</span>
            <span className="text-sm font-medium">My Cases</span>
          </Link>
          <Link to="/police/sos" className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition">
            <span className="text-2xl block">🆘</span>
            <span className="text-sm font-medium">SOS Alerts</span>
          </Link>
        </div>

        {/* Recent Cases */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-md font-semibold">📋 Recent Cases</h2>
            <Link to="/police/reports" className="text-sm text-blue-600 hover:text-blue-800">View All →</Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : recentCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cases found</div>
            ) : (
              recentCases.map((case_) => (
                <div key={case_.id} className="p-3 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getEmergencyIcon(case_.emergencyType)}</span>
                        <span className="font-semibold text-sm">#{case_.complaintId || case_.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{case_.emergencyType}</p>
                      <p className="text-xs text-gray-500">{formatTime(case_.timestamp)}</p>
                    </div>
                    <Link to={`/track/${case_.complaintId || case_.id}`} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                      View
                    </Link>
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

export default PoliceDashboard;