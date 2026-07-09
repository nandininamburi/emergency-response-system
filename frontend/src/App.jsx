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
import Login from './pages/Login';
import Register from './pages/Register';
import DispatcherSOS from './pages/DispatcherSOS';
import './index.css';

// Component to choose which navbar to show based on role
const NavbarSelector = () => {
  const [userRole, setUserRole] = React.useState('citizen');
  
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserRole(parsed.role || 'citizen');
    }
    
    // Listen for storage changes
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

  // Police gets PoliceNavbar, everyone else gets CitizenNavbar
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
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportEmergency />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/track/:id" element={<TrackComplaint />} />
              <Route path="/dispatcher" element={<DispatcherDashboard />} />
              <Route path="/police" element={<PoliceDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sos" element={<DispatcherSOS />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;