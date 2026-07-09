import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PoliceReports = () => {
  const [allEmergencies, setAllEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      setAllEmergencies(response.data);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setAllEmergencies([
        {
          id: 'ER1001',
          complaintId: 'ER260709-489486',
          emergencyType: 'Road Accident',
          description: 'Car collided with bike at intersection',
          status: 'Pending',
          name: 'Rahul Sharma',
          phone: '+919876543210',
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: new Date().toISOString(),
          priority: 'High',
          reportType: 'citizen'
        },
        {
          id: 'ER1002',
          complaintId: 'ER260709-489487',
          emergencyType: 'Fire',
          description: 'Building fire with smoke, people trapped',
          status: 'Assigned',
          name: 'Priya Patel',
          phone: '+919876543211',
          latitude: 12.9812,
          longitude: 77.7200,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          priority: 'Critical',
          reportType: 'dispatcher'
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
      fetchEmergencies();
      const messages = {
        'Assigned': '✅ Case accepted! You are now handling this case.',
        'On Route': '🚗 You are on the way to the location!',
        'Resolved': '✅ Case resolved successfully! Well done!'
      };
      alert(messages[status] || `✅ Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating case:', error);
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

  const filteredEmergencies = () => {
    if (filter === 'all') return allEmergencies;
    return allEmergencies.filter(e => e.status === filter);
  };

  const statusFilters = ['all', 'Pending', 'Assigned', 'On Route', 'Resolved'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 All Reports</h1>
            <p className="text-gray-600 text-sm">View and manage all emergency reports</p>
          </div>
          <button onClick={fetchEmergencies} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            🔄 Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? '📋 All' : status}
              {status !== 'all' && (
                <span className="ml-1 text-xs">
                  ({allEmergencies.filter(e => e.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-md font-semibold">Reports</h2>
            <span className="text-xs text-gray-500">{filteredEmergencies().length} cases</span>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : filteredEmergencies().length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cases found</div>
            ) : (
              filteredEmergencies().map((case_) => (
                <div key={case_.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{getEmergencyIcon(case_.emergencyType)}</span>
                        <span className="font-semibold">#{case_.complaintId || case_.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {case_.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          case_.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          case_.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {case_.priority || 'Medium'}
                        </span>
                        {case_.reportType === 'dispatcher' && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                            🆘 SOS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mt-1">{case_.emergencyType}</p>
                      <p className="text-sm text-gray-600">{case_.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span>👤 {case_.name || 'Unknown'}</span>
                        <span>📱 {case_.phone || 'N/A'}</span>
                        <span>🕐 {new Date(case_.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* ✅ Action Buttons */}
                    <div className="flex flex-wrap gap-1">
                      {/* Call Button */}
                      {case_.phone && (
                        <button 
                          onClick={() => makeCall(case_.phone)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center gap-1"
                        >
                          📞 Call
                        </button>
                      )}
                      
                      {/* Navigate Button */}
                      {case_.latitude && case_.longitude && (
                        <button 
                          onClick={() => navigateTo(case_.latitude, case_.longitude)}
                          className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition flex items-center gap-1"
                        >
                          🗺️ Navigate
                        </button>
                      )}
                      
                      {/* Accept Button */}
                      {case_.status === 'Pending' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'Assigned')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          👮 Accept
                        </button>
                      )}
                      
                      {/* En Route Button */}
                      {case_.status === 'Assigned' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'On Route')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition flex items-center gap-1"
                        >
                          🚗 Route
                        </button>
                      )}
                      
                      {/* Resolve Button */}
                      {case_.status === 'On Route' && (
                        <button 
                          onClick={() => updateCaseStatus(case_.id, 'Resolved')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center gap-1"
                        >
                          ✅ Resolve
                        </button>
                      )}
                      
                      {/* ✅ Removed "View" link - Police don't need Track page */}
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

export default PoliceReports;