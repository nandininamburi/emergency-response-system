import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">🚨 Emergency Response</h3>
            <p className="text-gray-300 text-sm">
              A complete emergency management system for citizens, dispatchers, and police officers.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/report" className="text-gray-300 hover:text-white">Report Emergency</Link></li>
              <li><Link to="/track" className="text-gray-300 hover:text-white">Track Complaint</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Numbers</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🚒 Fire: 101</li>
              <li>🚓 Police: 100</li>
              <li>🚑 Ambulance: 102</li>
              <li>🆘 Disaster: 108</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Emergency Response System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;