import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      // Typically there is an endpoint to update status
      await api.patch(`/api/bookings/${id}`, { status });
      
      // If approved, create an invoice for it
      if (status === 'APPROVED') {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          await api.post('/api/billing', {
            invoiceNumber: `INV-BKG-${id}`,
            booking: { id },
            amount: booking.totalAmount || 1000,
            status: 'Pending Payment',
            clientName: 'Client',
            eventName: booking.eventName || 'Event'
          });
        }
      }
      
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const pending = bookings.filter(b => b.status === 'PENDING' || !b.status);
  const approved = bookings.filter(b => b.status === 'APPROVED');

  return (
    <AdminLayout title="Bookings & Orders">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Requests Column */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Pending Requests <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">{pending.length}</span>
          </h3>
          {pending.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-blue-900">Booking #{b.id}</h4>
                <span className="font-bold text-gray-800">${b.totalAmount || '0'}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Date: {new Date(b.eventDate || b.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mb-4">{b.guestCount || 0} Guests</p>
              <div className="flex gap-2">
                <button onClick={() => handleStatusChange(b.id, 'APPROVED')} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700">Approve & Invoice</button>
                <button onClick={() => handleStatusChange(b.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-600 py-2 rounded text-sm font-medium hover:bg-red-100">Reject</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-gray-500 text-sm">No pending requests.</p>}
        </div>

        {/* Approved Orders Column */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Approved & Upcoming</h3>
          {approved.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-lg shadow border border-gray-200 border-l-4 border-l-green-500 mb-4">
              <h4 className="font-bold text-gray-800 mb-2">Booking #{b.id}</h4>
              <p className="text-sm text-gray-600 mb-1">Date: {new Date(b.eventDate || b.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600 mb-3">{b.guestCount || 0} Guests</p>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved</span>
            </div>
          ))}
          {approved.length === 0 && <p className="text-gray-500 text-sm">No approved bookings.</p>}
        </div>

      </div>
    </AdminLayout>
  );
};