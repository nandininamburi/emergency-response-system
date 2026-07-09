import React from "react";
import { Link } from "react-router-dom";

const EmergencyCard = ({ emergency }) => {
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Assigned: "bg-blue-100 text-blue-800",
      "On Route": "bg-purple-100 text-purple-800",
      Resolved: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getEmergencyIcon = (type) => {
    const icons = {
      Accident: "🚗",
      Fire: "🔥",
      Crime: "🚨",
      Medical: "🩺",
      Other: "📌",
    };
    return icons[type] || "📌";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getEmergencyIcon(emergency.emergencyType)}
            </span>
            <h3 className="text-lg font-semibold">#{emergency.id}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(emergency.status)}`}
            >
              {emergency.status}
            </span>
          </div>
          <p className="text-gray-700 mt-1">{emergency.emergencyType}</p>
          <p className="text-gray-600 text-sm mt-1">{emergency.description}</p>
          <div className="mt-2 text-xs text-gray-500">
            <span>👤 {emergency.name}</span>
            <span className="mx-2">•</span>
            <span>📱 {emergency.phone}</span>
          </div>
        </div>
        <Link
          to={`/track/${emergency.id}`}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default EmergencyCard;
