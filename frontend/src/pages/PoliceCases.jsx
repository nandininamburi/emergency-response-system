import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PoliceCases = () => {
  const [myCases, setMyCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCases();
  }, []);

  const fetchMyCases = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/emergencies`);
      // Filter for cases assigned to this officer
      const assignedCases = response.data.filter(e => e.assignedOfficer === 'Officer Kumar');
      setMyCases(assignedCases);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setMyCases([
        {
          id: 'ER1002',
          complaintId: 'ER260709-489487',
          emergencyType: 'Fire',
          description: 'Building fire with smoke, people trapped',
          status: 'Assigned',
          name: 'Priya Patel',
          phone: '+919876543211',
          timestamp: new Date().toISOString(),
          priority: 'Critical'
        },
        {
          id: 'ER1003',
          complaintId: 'ER260709-489488',
          emergencyType: 'Medical',
          description: 'Elderly person unconscious',
          status: 'On Route',
          name: 'Amit Kumar',
          phone: '+919876543212',
          timestamp: new Date().toISOString(),
          priority: 'High'
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

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/emergencies/${id}`, { status });
      fetchMyCases();
      alert(`✅ Status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👮 My Cases</h1>
            <p className="text-gray-600 text-sm">Cases assigned to you</p>
          </div>
          <button onClick={fetchMyCases} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">Total Cases</p>
            <p className="text-xl font-bold">{myCases.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">In Progress</p>
            <p className="text-xl font-bold text-purple-600">
              {myCases.filter(e => e.status === 'Assigned' || e.status === 'On Route').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-3">
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-xl font-bold text-green-600">
              {myCases.filter(e => e.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-md font-semibold">My Assigned Cases</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : myCases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <span className="text-4xl block mb-2">📭</span>
                <p>No cases assigned yet</p>
              </div>
            ) : (
              myCases.map((case_) => (
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
                      </div>
                      <p className="text-sm text-gray-800 mt-1">{case_.emergencyType}</p>
                      <p className="text-sm text-gray-600">{case_.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                        <span>👤 {case_.name}</span>
                        <span>📱 {case_.phone}</span>
                        <span>🕐 {new Date(case_.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link 
                        to={`/track/${case_.complaintId || case_.id}`} 
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition text-center"
                      >
                        View
                      </Link>
                      {case_.status === 'Assigned' && (
                        <button 
                          onClick={() => updateStatus(case_.id, 'On Route')}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                        >
                          🚗 En Route
                        </button>
                      )}
                      {case_.status === 'On Route' && (
                        <button 
                          onClick={() => updateStatus(case_.id, 'Resolved')}
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
    </div>
  );
};

export default PoliceCases;