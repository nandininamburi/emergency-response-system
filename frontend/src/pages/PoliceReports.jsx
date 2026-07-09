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
      // Demo data
      setAllEmergencies([
        {
          id: 'ER1001',
          complaintId: 'ER260709-489486',
          emergencyType: 'Road Accident',
          description: 'Car collided with bike at intersection',
          status: 'Pending',
          name: 'Rahul Sharma',
          phone: '+919876543210',
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
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          priority: 'Critical',
          reportType: 'dispatcher'
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
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
                    <Link 
                      to={`/track/${case_.complaintId || case_.id}`} 
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition ml-4"
                    >
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

export default PoliceReports;