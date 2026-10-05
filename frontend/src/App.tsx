import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AuthPage } from './pages/AuthPage';
import { ClientBookingRequest } from './pages/ClientBookingRequest';
import { ClientDashboard } from './pages/ClientDashboard';
import { ClientInquiries } from './pages/ClientInquiries';
import { AdminInventory } from './pages/AdminInventory';
import { AdminFeedback } from './pages/AdminFeedback';
import { AdminInquiries } from './pages/AdminInquiries';
import { AdminBilling } from './pages/AdminBilling';
import { AdminBookings } from './pages/AdminBookings';
import { AdminStaff } from './pages/AdminStaff';
import { AdminMenuEngineering } from './pages/AdminMenuEngineering';
import { AdminPackages } from './pages/AdminPackages';
import { AdminForecasting } from './pages/AdminForecasting';
import { AdminProfitability } from './pages/AdminProfitability';
import { AdminScheduling } from './pages/AdminScheduling';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminCustomer360 } from './pages/AdminCustomer360';
import { ProtectedRoute } from './auth';

import { AdminWasteTracker } from './pages/AdminWasteTracker';

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
      <Route path="/client/bookings" element={<ProtectedRoute roles={['CUSTOMER']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/inquiries" element={<ProtectedRoute roles={['CUSTOMER']}><ClientInquiries /></ProtectedRoute>} />

      {/* Admin/Staff Routes */}
      <Route path="/admin/customers" element={<ProtectedRoute roles={['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER']}><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/customers/:id" element={<ProtectedRoute roles={['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER']}><AdminCustomer360 /></ProtectedRoute>} />
      <Route path="/admin/scheduling" element={<ProtectedRoute roles={['EVENT_COORDINATION_OFFICER', 'GENERAL_MANAGER']}><AdminScheduling /></ProtectedRoute>} />
      <Route path="/admin/waste" element={<ProtectedRoute roles={['HEAD_CHEF', 'GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER']}><AdminWasteTracker /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute roles={['HEAD_CHEF', 'GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER']}><AdminInventory /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute roles={['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER']}><AdminFeedback /></ProtectedRoute>} />
      <Route path="/admin/inquiries" element={<ProtectedRoute roles={['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER']}><AdminInquiries /></ProtectedRoute>} />
      <Route path="/admin/billing" element={<ProtectedRoute roles={['FINANCE_OFFICER', 'GENERAL_MANAGER']}><AdminBilling /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute roles={['GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER']}><AdminStaff /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute roles={['HEAD_CHEF', 'GENERAL_MANAGER']}><AdminMenuEngineering /></ProtectedRoute>} />
      <Route path="/admin/packages" element={<ProtectedRoute roles={['HEAD_CHEF', 'GENERAL_MANAGER']}><AdminPackages /></ProtectedRoute>} />
      <Route path="/admin/forecast" element={<ProtectedRoute roles={['HEAD_CHEF', 'GENERAL_MANAGER']}><AdminForecasting /></ProtectedRoute>} />
      <Route path="/admin/profitability" element={<ProtectedRoute roles={['FINANCE_OFFICER', 'GENERAL_MANAGER']}><AdminProfitability /></ProtectedRoute>} />
      
      <Route path="/no-access" element={<div className="p-10 text-center"><h1 className="text-2xl font-bold">Access Denied</h1><p>You do not have permission to access the system dashboard.</p><button onClick={() => { sessionStorage.removeItem("catering_token"); window.location.href="/login"; }} className="mt-4 text-blue-500 underline">Logout</button></div>} />
      {/* Fallback */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

