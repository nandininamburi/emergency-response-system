import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ReportEmergency from './pages/ReportEmergency';
import TrackComplaint from './pages/TrackComplaint';
import DispatcherDashboard from './pages/DispatcherDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import DispatcherSOS from './pages/DispatcherSOS';  // ✅ Add this import
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportEmergency />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/track/:id" element={<TrackComplaint />} />
              <Route path="/dispatcher" element={<DispatcherDashboard />} />
              <Route path="/police" element={<PoliceDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sos" element={<DispatcherSOS />} />  {/* ✅ Add this route */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;