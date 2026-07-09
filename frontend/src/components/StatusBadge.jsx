import React from 'react';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'Assigned': { color: 'bg-blue-100 text-blue-800', icon: '👮' },
      'On Route': { color: 'bg-purple-100 text-purple-800', icon: '🚗' },
      'Resolved': { color: 'bg-green-100 text-green-800', icon: '✅' }
    };
    return configs[status] || configs['Pending'];
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    'small': 'px-2 py-0.5 text-xs',
    'default': 'px-3 py-1 text-sm',
    'large': 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;