import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Residents from './pages/dashboards/Residents';
import NoticeBoard from './pages/dashboards/NoticeBoard';
import Complaints from './pages/dashboards/Complaints';
import Billing from './pages/dashboards/Billing';
import Visitors from './pages/dashboards/Visitors';
import Vendors from './pages/dashboards/Vendors';
import Societies from './pages/dashboards/Societies';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Landing />} />
         <Route path="/login" element={<Login />} />
         
         <Route path="/" element={
            <ProtectedRoute>
               <DashboardLayout />
            </ProtectedRoute>
         }>
            <Route path="dashboard" element={<Dashboard />} />
            {/* Other routes will go here later */}
            <Route path="societies" element={<Societies />} />
            <Route path="residents" element={<Residents />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="billing" element={<Billing />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="vendors" element={<Vendors />} />
         </Route>

         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
