import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '../components/ClientLayout';
import { api } from '../api';

export const ClientBookingRequest = () => {
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(200);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/bookings', {
        eventDate: new Date(date).toISOString(),
        guestCount: guests,
        totalAmount: guests * 85,
        status: 'PENDING'
      });
      // redirect to dashboard
      navigate('/client/bookings');
    } catch (err) {
      console.error(err);
      // For now, if we get 401 unauth, redirect to login
      navigate('/login');
    }
  };

  return (
    <ClientLayout title="Request a Booking">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Event Schedule & Venue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                <input type="text" className="w-full p-2 border border-gray-300 rounded" placeholder="e.g., Metropolitan Pavilion, Grand Hall" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. Attendance & Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input required type="number" value={guests} onChange={e=>setGuests(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" placeholder="e.g., 200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Package</label>
                <select className="w-full p-2 border border-gray-300 rounded bg-white">
                  <option>Gold Imperial Wedding Buffet ($85/hd)</option>
                  <option>Executive Boardroom Luncheon ($42.50/hd)</option>
                  <option>Artisan Tapas Soirée ($55/hd)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit sticky top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Reservation Summary</h3>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex justify-between"><span className="font-medium">Guests:</span> <span>{guests}</span></div>
            <div className="flex justify-between"><span className="font-medium">Base Price:</span> <span>${(guests * 85).toFixed(2)}</span></div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total Estimated:</span>
              <span>${(guests * 85).toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition duration-200">
            Submit Booking Request
          </button>
        </div>

      </form>
    </ClientLayout>
  );
};