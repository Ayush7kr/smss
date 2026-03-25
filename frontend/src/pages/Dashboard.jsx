import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import SocietyAdminDashboard from './dashboards/SocietyAdminDashboard';
import ResidentDashboard from './dashboards/ResidentDashboard';
import SecurityGuardDashboard from './dashboards/SecurityGuardDashboard';
import VendorDashboard from './dashboards/VendorDashboard';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'Super_Admin':
      return <SuperAdminDashboard />;
    case 'Society_Admin':
      return <SocietyAdminDashboard />;
    case 'Resident':
      return <ResidentDashboard />;
    case 'Security_Guard':
      return <SecurityGuardDashboard />;
    case 'Vendor':
      return <VendorDashboard />;
    default:
      return <div>Invalid Role</div>;
  }
}
