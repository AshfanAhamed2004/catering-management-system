import { Link } from 'react-router-dom';

export const ClientLayout = ({ children, title }: { children: React.ReactNode, title?: string }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="Smart Serve" className="h-10" />
            </div>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Request Booking</Link>
              <Link to="/client/bookings" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium">My Bookings</Link>
              <Link to="/login" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors">Sign In</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
        {children}
      </main>
    </div>
  );
};
