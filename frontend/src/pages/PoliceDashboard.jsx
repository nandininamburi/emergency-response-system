import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const PoliceDashboard = () => {
  const [allEmergencies, setAllEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
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
    const interval = setInterval(fetchEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      setAllEmergencies(response.data);
      updateStats(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      // Demo data with reportType
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
          reportType: 'citizen',
          reporterRole: 'citizen'
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
          reportType: 'dispatcher',
          reporterRole: 'dispatcher',
          dispatcherName: 'Priya Patel',
          dispatcherPhone: '+919876543211',
          dispatcherAge: '32'
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
          reportType: 'citizen',
          reporterRole: 'citizen'
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
          reportType: 'dispatcher',
          reporterRole: 'dispatcher',
          dispatcherName: 'Sneha Reddy',
          dispatcherPhone: '+919876543213',
          dispatcherAge: '28'
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

  const updateCaseStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/emergencies/${id}`, { 
        status,
        assignedOfficer: 'Officer Kumar',
        updatedAt: new Date().toISOString()
      });
      fetchEmergencies();
      const messages = {
        'Assigned': '✅ Case accepted! You are now handling this case.',
        'On Route': '🚗 You are on the way to the location!',
        'Resolved': '✅ Case resolved successfully! Well done!'
      };
      alert(messages[status] || `✅ Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating case:', error);
      setAllEmergencies(prev => 
        prev.map(c => c.id === id ? { ...c, status } : c)
      );
    }
  };

  const makeCall = (phoneNumber) => {
    if (!phoneNumber) {
      alert('📱 No phone number available');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleanNumber) {
      window.location.href = `tel:${cleanNumber}`;
    } else {
      alert('📱 Invalid phone number');
    }
  };

  const navigateTo = (lat, lng, address) => {
    if (!lat || !lng) {
      alert('📍 Location coordinates not available');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
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

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': '⏳',
      'Assigned': '👮',
      'On Route': '🚗',
      'Resolved': '✅'
    };
    return icons[status] || '📌';
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

  const getPriorityIcon = (priority) => {
    const icons = {
      'Low': '🟢',
      'Medium': '🟡',
      'High': '🟠',
      'Critical': '🔴'
    };
    return icons[priority] || '⚪';
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

  const filteredEmergencies = () => {
    if (filter === 'all') return allEmergencies;
    if (filter === 'sos') return allEmergencies.filter(e => e.reportType === 'dispatcher');
    if (filter === 'citizen') return allEmergencies.filter(e => e.reportType === 'citizen' || !e.reportType);
    return allEmergencies.filter(e => e.status === filter);
  };

  // View Details Modal
  const ViewDetails = ({ emergency, onClose }) => {
    if (!emergency) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Case #{emergency.complaintId || emergency.id}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            
            <div className="space-y-4">
              {/* Report Type Badge */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  emergency.reportType === 'dispatcher' 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {emergency.reportType === 'dispatcher' ? '🆘 SOS Emergency' : '👤 Citizen Report'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(emergency.status)}`}>
                  {getStatusIcon(emergency.status)} {emergency.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(emergency.priority)}`}>
                  {getPriorityIcon(emergency.priority)} {emergency.priority || 'Medium'}
                </span>
              </div>

              {/* Reporter Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  {emergency.reportType === 'dispatcher' ? '👤 Dispatcher Details' : '👤 Reporter Details'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="ml-2 font-medium">{emergency.dispatcherName || emergency.name || 'Unknown'}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="ml-2 font-medium">{emergency.dispatcherPhone || emergency.phone || 'N/A'}</span></div>
                  {emergency.dispatcherAge && (
                    <div><span className="text-gray-500">Age:</span> <span className="ml-2 font-medium">{emergency.dispatcherAge}</span></div>
                  )}
                  <div><span className="text-gray-500">Blood Group:</span> <span className="ml-2 font-medium">{emergency.bloodGroup || 'N/A'}</span></div>
                  {emergency.aadhar && (
                    <div className="col-span-2"><span className="text-gray-500">Aadhaar:</span> <span className="ml-2 font-medium">{emergency.aadhar}</span></div>
                  )}
                  {emergency.allergies && (
                    <div className="col-span-2"><span className="text-gray-500">Allergies:</span> <span className="ml-2 font-medium text-red-600">{emergency.allergies}</span></div>
                  )}
                  <div className="col-span-2"><span className="text-gray-500">Reported:</span> <span className="ml-2 font-medium">{formatTime(emergency.timestamp)}</span></div>
                </div>
              </div>

              {/* Emergency Contact */}
              {(emergency.emergencyContact || emergency.emergencyContactPhone) && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">🆘 Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="ml-2 font-medium">{emergency.emergencyContact || 'N/A'}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="ml-2 font-medium">{emergency.emergencyContactPhone || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* Incident Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">🚨 Incident Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Type:</span> <span className="ml-2 font-medium">{emergency.emergencyType}</span></div>
                  <div><span className="text-gray-500">Description:</span> <p className="mt-1 text-gray-700 bg-white p-2 rounded">{emergency.description}</p></div>
                  <div><span className="text-gray-500">Address:</span> <span className="ml-2 font-medium">{emergency.address || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Location:</span> <span className="ml-2 font-medium">{emergency.latitude?.toFixed(6)}, {emergency.longitude?.toFixed(6)}</span></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap mt-4">
                {(emergency.phone || emergency.dispatcherPhone) && (
                  <button onClick={() => makeCall(emergency.phone || emergency.dispatcherPhone)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                    📞 Call Reporter
                  </button>
                )}
                {emergency.latitude && emergency.longitude && (
                  <button onClick={() => navigateTo(emergency.latitude, emergency.longitude, emergency.address)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    🗺️ Navigate
                  </button>
                )}
                <Link to={`/track/${emergency.complaintId || emergency.id}`} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
                  📋 Track
                </Link>
              </div>

              {/* Status Update */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">📊 Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {emergency.status === 'Pending' && (
                    <button onClick={() => { updateCaseStatus(emergency.id, 'Assigned'); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      👮 Accept Case
                    </button>
                  )}
                  {emergency.status === 'Assigned' && (
                    <button onClick={() => { updateCaseStatus(emergency.id, 'On Route'); onClose(); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                      🚗 En Route
                    </button>
                  )}
                  {emergency.status === 'On Route' && (
                    <button onClick={() => { updateCaseStatus(emergency.id, 'Resolved'); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                      ✅ Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👮 Police Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome back, Officer Kumar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchEmergencies} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full"><span className="text-blue-600">📋</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-full"><span className="text-yellow-600">⏳</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-semibold">{stats.pending}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full"><span className="text-blue-600">👮</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Assigned</p><p className="text-xl font-semibold">{stats.assigned}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-full"><span className="text-purple-600">🚗</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">On Route</p><p className="text-xl font-semibold">{stats.onRoute}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full"><span className="text-green-600">✅</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Resolved</p><p className="text-xl font-semibold">{stats.resolved}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-full"><span className="text-red-600">🆘</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">SOS</p><p className="text-xl font-semibold">{stats.sos}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full"><span className="text-green-600">👤</span></div>
              <div className="ml-3"><p className="text-xs text-gray-500">Citizen</p><p className="text-xl font-semibold">{stats.citizen}</p></div>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">📍 Live Tracking - All Emergencies</h2>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="h-72 md:h-80 rounded-lg overflow-hidden border border-gray-200">
            <MapComponent emergencies={allEmergencies} />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            📋 All ({stats.total})
          </button>
          <button onClick={() => setFilter('sos')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'sos' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            🆘 SOS ({stats.sos})
          </button>
          <button onClick={() => setFilter('citizen')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'citizen' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            👤 Citizen ({stats.citizen})
          </button>
          <button onClick={() => setFilter('Pending')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            ⏳ Pending ({stats.pending})
          </button>
          <button onClick={() => setFilter('Assigned')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'Assigned' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            👮 Assigned ({stats.assigned})
          </button>
          <button onClick={() => setFilter('On Route')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'On Route' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            🚗 On Route ({stats.onRoute})
          </button>
          <button onClick={() => setFilter('Resolved')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === 'Resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            ✅ Resolved ({stats.resolved})
          </button>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-md font-semibold">📋 All Emergency Reports</h2>
            <span className="text-xs text-gray-500">{filteredEmergencies().length} cases</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="mt-2">Loading cases...</p>
              </div>
            ) : filteredEmergencies().length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <span className="text-4xl block mb-2">📭</span>
                <p>No cases found</p>
              </div>
            ) : (
              filteredEmergencies().map((case_) => (
                <div key={case_.id} className="p-3 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Report Type Badge - SOS or Citizen */}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          case_.reportType === 'dispatcher' 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {case_.reportType === 'dispatcher' ? '🆘 SOS' : '👤 Citizen'}
                        </span>
                        <span className="text-xl">{getEmergencyIcon(case_.emergencyType)}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">#{case_.complaintId || case_.id}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {getStatusIcon(case_.status)} {case_.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                          {getPriorityIcon(case_.priority)} {case_.priority || 'Medium'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mt-0.5">{case_.emergencyType}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{case_.description}</p>
                      <div className="flex flex-wrap gap-1 text-xs text-gray-500 mt-0.5">
                        <span>👤 {case_.dispatcherName || case_.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>📱 {case_.dispatcherPhone || case_.phone || 'N/A'}</span>
                        {case_.bloodGroup && <span>• 🩸 {case_.bloodGroup}</span>}
                        <span>• 🕐 {formatTime(case_.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => { setSelectedCase(case_); setShowDetails(true); }} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">
                        📋 Details
                      </button>
                      {(case_.phone || case_.dispatcherPhone) && (
                        <button onClick={() => makeCall(case_.phone || case_.dispatcherPhone)} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                          📞 Call
                        </button>
                      )}
                      {case_.latitude && case_.longitude && (
                        <button onClick={() => navigateTo(case_.latitude, case_.longitude, case_.address)} className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition">
                          🗺️ Navigate
                        </button>
                      )}
                      {case_.status === 'Pending' && (
                        <button onClick={() => updateCaseStatus(case_.id, 'Assigned')} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">
                          👮 Accept
                        </button>
                      )}
                      {case_.status === 'Assigned' && (
                        <button onClick={() => updateCaseStatus(case_.id, 'On Route')} className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition">
                          🚗 Route
                        </button>
                      )}
                      {case_.status === 'On Route' && (
                        <button onClick={() => updateCaseStatus(case_.id, 'Resolved')} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                          ✅ Resolve
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

      {/* Details Modal */}
      {showDetails && selectedCase && (
        <ViewDetails emergency={selectedCase} onClose={() => { setShowDetails(false); setSelectedCase(null); }} />
      )}
    </div>
  );
};

export default PoliceDashboard;