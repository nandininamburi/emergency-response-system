import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';

const PoliceSOS = () => {
  const [sosEmergencies, setSosEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
          latitude: 12.9812,
          longitude: 77.7200,
          timestamp: new Date().toISOString(),
          priority: 'Critical',
          reportType: 'dispatcher',
          dispatcherName: 'Priya Patel',
          dispatcherPhone: '+919876543211',
          bloodGroup: 'B+',
          address: 'Indiranagar, Bangalore'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/emergencies/${id}`, { 
        status,
        assignedOfficer: 'Officer Kumar',
        updatedAt: new Date().toISOString()
      });
      fetchSOS();
      const messages = {
        'Assigned': '✅ Case accepted! You are now handling this SOS alert.',
        'On Route': '🚗 You are on the way to the SOS location!',
        'Resolved': '✅ SOS case resolved successfully! Well done!'
      };
      alert(messages[status] || `✅ Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
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

  const navigateTo = (lat, lng) => {
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

  // ✅ View Details Modal with Map
  const ViewDetailsModal = ({ case_, onClose }) => {
    if (!case_) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-red-600">
                🆘 SOS Case #{case_.complaintId || case_.id}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            
            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300 animate-pulse">
                  🆘 SOS
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(case_.status)}`}>
                  {case_.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  🔴 {case_.priority || 'Critical'}
                </span>
              </div>

              {/* Reporter Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">👤 Dispatcher Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Name:</span> <span className="ml-2 font-medium">{case_.dispatcherName || case_.name || 'Unknown'}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="ml-2 font-medium">{case_.dispatcherPhone || case_.phone || 'N/A'}</span></div>
                  {case_.bloodGroup && (
                    <div><span className="text-gray-500">Blood Group:</span> <span className="ml-2 font-medium text-red-600">{case_.bloodGroup}</span></div>
                  )}
                  <div><span className="text-gray-500">Reported:</span> <span className="ml-2 font-medium">{new Date(case_.timestamp).toLocaleString()}</span></div>
                </div>
              </div>

              {/* Incident Details */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-semibold text-gray-700 mb-2">🚨 SOS Incident Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Type:</span> <span className="ml-2 font-medium">{case_.emergencyType}</span></div>
                  <div><span className="text-gray-500">Description:</span> <p className="mt-1 text-gray-700 bg-white p-2 rounded">{case_.description}</p></div>
                  <div><span className="text-gray-500">Address:</span> <span className="ml-2 font-medium">{case_.address || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Location:</span> <span className="ml-2 font-medium">{case_.latitude?.toFixed(6)}, {case_.longitude?.toFixed(6)}</span></div>
                </div>
              </div>

              {/* ✅ Mini Map - Like Swiggy/Zomato */}
              {case_.latitude && case_.longitude && (
                <div className="rounded-lg overflow-hidden border border-red-200">
                  <div className="h-48">
                    <MapComponent 
                      emergencies={[case_]} 
                      center={[case_.latitude, case_.longitude]} 
                    />
                  </div>
                  <p className="text-xs text-center text-red-600 py-1 font-medium">📍 SOS Emergency Location</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap mt-4">
                {(case_.phone || case_.dispatcherPhone) && (
                  <button 
                    onClick={() => {
                      makeCall(case_.phone || case_.dispatcherPhone);
                      onClose();
                    }} 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    📞 Call Dispatcher
                  </button>
                )}
                {case_.latitude && case_.longitude && (
                  <button 
                    onClick={() => {
                      navigateTo(case_.latitude, case_.longitude);
                      onClose();
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    🗺️ Navigate
                  </button>
                )}
                {case_.status === 'Pending' && (
                  <button 
                    onClick={() => {
                      updateCaseStatus(case_.id, 'Assigned');
                      onClose();
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    👮 Accept SOS
                  </button>
                )}
                {case_.status === 'Assigned' && (
                  <button 
                    onClick={() => {
                      updateCaseStatus(case_.id, 'On Route');
                      onClose();
                    }} 
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                  >
                    🚗 En Route
                  </button>
                )}
                {case_.status === 'On Route' && (
                  <button 
                    onClick={() => {
                      updateCaseStatus(case_.id, 'Resolved');
                      onClose();
                    }} 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    ✅ Resolve
                  </button>
                )}
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-red-600">🆘 SOS Alerts</h1>
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
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
                <p className="mt-2">Loading SOS alerts...</p>
              </div>
            ) : sosEmergencies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <span className="text-4xl block mb-2">✅</span>
                <p>No SOS alerts</p>
              </div>
            ) : (
              sosEmergencies.map((case_) => (
                <div key={case_.id} className="p-4 hover:bg-red-50 transition border-l-4 border-red-500">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-[200px]">
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
                    
                    {/* ✅ Action Buttons */}
                    <div className="flex flex-wrap gap-1">
                      {/* Details Button */}
                      <button 
                        onClick={() => {
                          setSelectedCase(case_);
                          setShowDetails(true);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition text-center"
                      >
                        🚨 Details
                      </button>
                      
                      {/* Call Button */}
                      {(case_.phone || case_.dispatcherPhone) && (
                        <button 
                          onClick={() => makeCall(case_.phone || case_.dispatcherPhone)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition text-center"
                        >
                          📞 Call
                        </button>
                      )}
                      
                      {/* Navigate Button */}
                      {case_.latitude && case_.longitude && (
                        <button 
                          onClick={() => navigateTo(case_.latitude, case_.longitude)}
                          className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition text-center"
                        >
                          🗺️ Navigate
                        </button>
                      )}
                      
                      {/* Accept SOS Button */}
                      {case_.status === 'Pending' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'Assigned')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                          👮 Accept
                        </button>
                      )}
                      
                      {/* En Route Button */}
                      {case_.status === 'Assigned' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'On Route')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                        >
                          🚗 Route
                        </button>
                      )}
                      
                      {/* Resolve Button */}
                      {case_.status === 'On Route' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'Resolved')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                        >
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

      {/* ✅ Details Modal */}
      {showDetails && selectedCase && (
        <ViewDetailsModal 
          case_={selectedCase} 
          onClose={() => {
            setShowDetails(false);
            setSelectedCase(null);
          }} 
        />
      )}
    </div>
  );
};

export default PoliceSOS;