import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const TrackComplaint = () => {
  const { id } = useParams();
  const [complaintId, setComplaintId] = useState(id || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-track if ID is provided in URL
  useEffect(() => {
    if (id && id !== 'undefined' && id.trim() !== '') {
      setComplaintId(id);
      // Auto track after a small delay
      const timer = setTimeout(() => {
        handleTrack();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleTrack = async () => {
    if (!complaintId || complaintId === 'undefined' || !complaintId.trim()) {
      setError('Please enter a valid Complaint ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://emergency-backend-uzkq.onrender.com/api';
      const response = await axios.get(
        `${apiUrl}/emergencies/${complaintId.trim()}`
      );
      setComplaint(response.data);
      if (response.data.complaintId) {
        setComplaintId(response.data.complaintId);
      }
    } catch (err) {
      console.error('Track error:', err);
      setError('Complaint not found. Please check the ID and try again.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDetails = (status) => {
    const details = {
      'Pending': {
        icon: '⏳',
        color: 'bg-yellow-100 text-yellow-800',
        border: 'border-yellow-400',
        description: 'Your report has been received and is waiting for review.'
      },
      'Assigned': {
        icon: '👮',
        color: 'bg-blue-100 text-blue-800',
        border: 'border-blue-400',
        description: 'A police officer has been assigned to your case.'
      },
      'On Route': {
        icon: '🚗',
        color: 'bg-purple-100 text-purple-800',
        border: 'border-purple-400',
        description: 'The assigned officer is on their way to the location.'
      },
      'Resolved': {
        icon: '✅',
        color: 'bg-green-100 text-green-800',
        border: 'border-green-400',
        description: 'Your complaint has been resolved successfully.'
      }
    };
    return details[status] || details['Pending'];
  };

  const getStatusSteps = () => {
    const steps = ['Pending', 'Assigned', 'On Route', 'Resolved'];
    if (!complaint) return steps;
    
    const currentIndex = steps.indexOf(complaint.status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📋 Track Your Complaint</h1>
          <p className="text-gray-600 mt-2">Enter your Complaint ID to check the status</p>
          <p className="text-xs text-gray-400 mt-1">Example: ER240115-123456</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
              placeholder="Enter Complaint ID (e.g., ER240115-123456)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium whitespace-nowrap"
            >
              {loading ? 'Searching...' : '🔍 Track'}
            </button>
          </div>
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Your Complaint ID was sent to you when you submitted the report
          </p>
        </div>

        {/* Complaint Details */}
        {complaint && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Complaint #{complaint.complaintId || complaint.id}
                  </h2>
                  <p className="text-blue-200 text-sm">
                    {formatDate(complaint.timestamp)}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full ${getStatusDetails(complaint.status).color}`}>
                  <span className="font-medium">
                    {getStatusDetails(complaint.status).icon} {complaint.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(complaint.priority)}`}>
                  {complaint.priority || 'Medium'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{complaint.emergencyType}</span>
              </div>
              {complaint.reportType && (
                <div>
                  <span className="text-gray-500">Report Type:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    complaint.reportType === 'dispatcher' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {complaint.reportType === 'dispatcher' ? '🆘 SOS' : '👤 Citizen'}
                  </span>
                </div>
              )}
              {complaint.assignedOfficer && (
                <div>
                  <span className="text-gray-500">Officer:</span>
                  <span className="ml-2 font-medium">{complaint.assignedOfficer}</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{complaint.dispatcherName || complaint.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{complaint.dispatcherPhone || complaint.phone || 'N/A'}</p>
                </div>
                {complaint.dispatcherAge && (
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{complaint.dispatcherAge}</p>
                  </div>
                )}
                {complaint.bloodGroup && (
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="font-medium text-red-600">{complaint.bloodGroup}</p>
                  </div>
                )}
                {complaint.aadhar && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Aadhaar</p>
                    <p className="font-medium">{complaint.aadhar}</p>
                  </div>
                )}
                {complaint.allergies && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Allergies</p>
                    <p className="font-medium text-red-600">{complaint.allergies}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{complaint.description}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">
                    📍 Lat: {complaint.latitude?.toFixed(6)}, Lng: {complaint.longitude?.toFixed(6)}
                  </p>
                  {complaint.address && (
                    <p className="text-sm text-gray-500 mt-1">{complaint.address}</p>
                  )}
                </div>

                {/* ✅ Voice Message Section */}
                {complaint.voiceMessage && (
                  <div className="col-span-2 bg-purple-50 p-3 rounded-lg mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">🎙️ Voice Message</p>
                    <audio controls className="w-full">
                      <source src={complaint.voiceMessage} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-gray-500 mt-1">📢 Voice message from reporter</p>
                  </div>
                )}

                {/* ✅ Photo/Image Section */}
                {complaint.photo && (
                  <div className="col-span-2 bg-green-50 p-3 rounded-lg mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">📸 Evidence Photo</p>
                    <img 
                      src={complaint.photo} 
                      alt="Emergency evidence" 
                      className="max-w-full max-h-64 rounded-lg object-contain"
                    />
                    <p className="text-xs text-gray-500 mt-1">📷 Evidence from the scene</p>
                  </div>
                )}

                {(complaint.emergencyContact || complaint.emergencyContactPhone) && (
                  <div className="col-span-2 bg-yellow-50 p-3 rounded-lg mt-2">
                    <p className="text-sm font-semibold text-gray-700">🆘 Emergency Contact</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                      <div><span className="text-gray-500">Name:</span> <span className="ml-2 font-medium">{complaint.emergencyContact || 'N/A'}</span></div>
                      <div><span className="text-gray-500">Phone:</span> <span className="ml-2 font-medium">{complaint.emergencyContactPhone || 'N/A'}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="px-6 py-4">
              <h3 className="font-semibold mb-4">📊 Status Timeline</h3>
              <div className="relative">
                {getStatusSteps().map((step, index) => (
                  <div key={index} className="flex items-center mb-4 last:mb-0">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      {index < getStatusSteps().length - 1 && (
                        <div className={`w-0.5 h-8 ml-4 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${
                        step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.step}
                        {step.active && ' (Current)'}
                      </p>
                      {step.active && (
                        <p className="text-sm text-gray-500">
                          {getStatusDetails(step.step).description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Complaint ID */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                📋 Complaint ID: <strong className="text-blue-600">{complaint.complaintId || complaint.id}</strong>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(complaint.complaintId || complaint.id);
                  alert('✅ Complaint ID copied to clipboard!');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                📋 Copy ID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;