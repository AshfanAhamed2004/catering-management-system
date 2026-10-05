const fs = require('fs');

const layout = 
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export const AdminLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname.includes(path) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700';

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <img src="/logo.png" alt="Smart Serve" className="h-10 mb-1" />
          <span className="text-xs text-gray-500 uppercase font-semibold">Catering Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'].includes(user.role) && (
            <Link to="/admin/bookings" className={\lock px-4 py-2 rounded-md \\}>Bookings & Orders</Link>
          )}
          {['GENERAL_MANAGER', 'HEAD_CHEF'].includes(user.role) && (
            <>
              <Link to="/admin/menu" className={\lock px-4 py-2 rounded-md \\}>Menu Engineering</Link>
              <Link to="/admin/packages" className={\lock px-4 py-2 rounded-md \\}>Packages Catalog</Link>
              <Link to="/admin/forecast" className={\lock px-4 py-2 rounded-md \\}>Ingredient Forecasting</Link>
            </>
          )}
          {['GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER'].includes(user.role) && (
            <Link to="/admin/scheduling" className={\lock px-4 py-2 rounded-md \\}>Staff Scheduling</Link>
          )}
          {['GENERAL_MANAGER', 'HEAD_CHEF', 'EVENT_COORDINATION_OFFICER'].includes(user.role) && (
            <>
              <Link to="/admin/waste" className={\lock px-4 py-2 rounded-md \\}>Waste Tracker</Link>
              <Link to="/admin/inventory" className={\lock px-4 py-2 rounded-md \\}>Inventory & Resources</Link>
            </>
          )}
          {['GENERAL_MANAGER', 'FINANCE_OFFICER'].includes(user.role) && (
            <>
              <Link to="/admin/profitability" className={\lock px-4 py-2 rounded-md \\}>Revenue & Receivables</Link>
              <Link to="/admin/billing" className={\lock px-4 py-2 rounded-md \\}>Billing & Invoicing</Link>
            </>
          )}
          {['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'].includes(user.role) && (
            <Link to="/admin/feedback" className={\lock px-4 py-2 rounded-md \\}>Feedback & Reviews</Link>
          )}
          {['GENERAL_MANAGER'].includes(user.role) && (
            <Link to="/admin/staff" className={\lock px-4 py-2 rounded-md \\}>Staff & Users</Link>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Logout</Link>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
;

fs.writeFileSync('frontend/src/components/AdminLayout.tsx', layout);
