import { Link } from 'react-router-dom';

export const AdminLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <img src="/logo.png" alt="Smart Serve" className="h-10 mb-1" />
          <span className="text-xs text-gray-500 uppercase font-semibold">Catering Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin/bookings" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Bookings & Orders</Link>
          <Link to="/admin/menu" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Menu Engineering</Link>
          <Link to="/admin/packages" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Packages Catalog</Link>
          <Link to="/admin/inventory" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Inventory & Resources</Link>
          <Link to="/admin/billing" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Billing & Invoicing</Link>
          <Link to="/admin/feedback" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Feedback & Reviews</Link>
          <Link to="/admin/staff" className="block px-4 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700">Staff & Users</Link>
        </nav>
      </aside>

      {/* Main Content */}
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
