import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClientLayout } from '../components/ClientLayout';
import { api } from '../api';

export const ClientDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings'); // Might need to filter by user in real app
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <ClientLayout title="My Dashboard">
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="font-bold text-blue-800">You have {bookings.filter(b=>b.status==='APPROVED').length} upcoming events</h3>
          </div>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700">Request New Booking</Link>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Bookings</h3>
      <div className="space-y-4">
        
        {bookings.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${b.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {b.status || 'PENDING'}
                </span>
                <span className="text-sm text-gray-500 font-mono">BKG-{b.id}</span>
              </div>
              <p className="text-sm text-gray-600">Date: {new Date(b.eventDate || b.createdAt).toLocaleDateString()} • {b.guestCount} Guests</p>
            </div>
            <div className="text-right flex flex-col justify-end">
              <span className="font-bold text-xl text-gray-900 mb-2">${b.totalAmount}</span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-gray-500">You have no bookings yet.</p>}

      </div>
    </ClientLayout>
  );
};