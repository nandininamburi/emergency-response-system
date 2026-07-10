import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ReportEmergency from "./pages/ReportEmergency";
import TrackComplaint from "./pages/TrackComplaint";
import DispatcherDashboard from "./pages/DispatcherDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import PoliceReports from "./pages/PoliceReports";
import PoliceSOS from "./pages/PoliceSOS";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DispatcherSOS from "./pages/DispatcherSOS";
import "./index.css";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportEmergency />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/track/:id" element={<TrackComplaint />} />

            {/* Dispatcher Routes */}
            <Route path="/dispatcher" element={<DispatcherDashboard />} />
            <Route path="/sos" element={<DispatcherSOS />} />

            {/* Police Routes */}
            <Route path="/police" element={<PoliceDashboard />} />
            <Route path="/police/reports" element={<PoliceReports />} />
            <Route path="/police/sos" element={<PoliceSOS />} />

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;