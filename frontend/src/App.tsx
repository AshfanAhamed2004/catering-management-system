import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AuthPage } from './pages/AuthPage';
import { ClientBookingRequest } from './pages/ClientBookingRequest';
import { ClientDashboard } from './pages/ClientDashboard';
import { AdminInventory } from './pages/AdminInventory';
import { AdminFeedback } from './pages/AdminFeedback';
import { AdminBilling } from './pages/AdminBilling';
import { AdminBookings } from './pages/AdminBookings';
import { AdminStaff } from './pages/AdminStaff';
import { AdminMenuEngineering } from './pages/AdminMenuEngineering';
import { AdminPackages } from './pages/AdminPackages';

export default function App() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Client Routes */}
      <Route path="/" element={<ClientBookingRequest />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/client/bookings" element={<ClientDashboard />} />

      {/* Admin/Staff Routes */}
      <Route path="/admin/inventory" element={<AdminInventory />} />
      <Route path="/admin/feedback" element={<AdminFeedback />} />
      <Route path="/admin/billing" element={<AdminBilling />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />
      <Route path="/admin/staff" element={<AdminStaff />} />
      <Route path="/admin/menu" element={<AdminMenuEngineering />} />
      <Route path="/admin/packages" element={<AdminPackages />} />
      
      {/* Fallback */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}
