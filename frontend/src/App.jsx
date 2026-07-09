import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CitizenNavbar from './components/CitizenNavbar';
import PoliceNavbar from './components/PoliceNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ReportEmergency from './pages/ReportEmergency';
import TrackComplaint from './pages/TrackComplaint';
import DispatcherDashboard from './pages/DispatcherDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import PoliceLiveMap from './pages/PoliceLiveMap';
import PoliceReports from './pages/PoliceReports';
import PoliceCases from './pages/PoliceCases';
import PoliceSOS from './pages/PoliceSOS';
import Login from './pages/Login';
import Register from './pages/Register';
import DispatcherSOS from './pages/DispatcherSOS';
import './index.css';

const NavbarSelector = () => {
  const [userRole, setUserRole] = React.useState('citizen');
  
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserRole(parsed.role || 'citizen');
    }
    
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        const parsed = JSON.parse(updatedUser);
        setUserRole(parsed.role || 'citizen');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (userRole === 'police') {
    return <PoliceNavbar />;
  }
  return <CitizenNavbar />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <NavbarSelector />
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
              <Route path="/police/map" element={<PoliceLiveMap />} />
              <Route path="/police/reports" element={<PoliceReports />} />
              <Route path="/police/cases" element={<PoliceCases />} />
              <Route path="/police/sos" element={<PoliceSOS />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;