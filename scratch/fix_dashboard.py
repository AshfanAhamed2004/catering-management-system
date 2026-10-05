import re

with open('frontend/src/pages/ClientDashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add states for Edit
edit_states = '''
  const [editBooking, setEditBooking] = useState<any>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('18:00');
  const [editLocation, setEditLocation] = useState('');
  const [editGuests, setEditGuests] = useState(200);
  const [editPackageId, setEditPackageId] = useState(1);

  const cancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(/bookings/\/cancel);
      fetchData();
    } catch(err) {
      alert(errorMessage(err));
    }
  };

  const openEdit = (b: any) => {
    setEditBooking(b);
    setEditDate(b.event_date || '');
    setEditTime(b.event_time ? b.event_time.substring(0,5) : '18:00');
    setEditLocation(b.event_location || '');
    setEditGuests(b.guest_count || 200);
    setEditPackageId(b.package_id || 1);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(/bookings/\, {
        event_date: editDate,
        event_time: editTime + ':00',
        guest_count: editGuests,
        event_location: editLocation,
        package_id: editPackageId
      });
      setEditBooking(null);
      fetchData();
    } catch(err) {
      alert(errorMessage(err));
    }
  };
'''
code = code.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');\n" + edit_states)

# Add buttons
buttons = '''
              <div className="flex gap-2 mt-2 justify-end">
                {b.status === 'PENDING' && (
                   <>
                     <button onClick={() => openEdit(b)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 font-medium">Edit</button>
                     <button onClick={() => cancelBooking(b.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-medium">Cancel</button>
                   </>
                )}
                {(isEligibleForFeedback && !hasFeedback && b.status !== 'CANCELLED' && b.status !== 'REJECTED') && (
                   <button onClick={() => setFeedbackForm(b.id)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 font-medium">Leave Feedback</button>
                )}
              </div>
'''
code = re.sub(
    r'\{\(isEligibleForFeedback[^}]*\}\)', 
    buttons.replace('\\', '\\\\'), 
    code
)

# Add Edit Modal
edit_modal = '''
      {editBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h3 className="font-bold text-lg mb-4">Edit Booking</h3>
              <form onSubmit={submitEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input required type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                    <input required type="time" value={editTime} onChange={e=>setEditTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                    <input required type="number" value={editGuests} onChange={e=>setEditGuests(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Package</label>
                    <select value={editPackageId} onChange={e=>setEditPackageId(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded bg-white">
                      <option value={1}>Gold Imperial Wedding Buffet (/hd)</option>
                      <option value={2}>Executive Boardroom Luncheon (.50/hd)</option>
                      <option value={3}>Artisan Tapas Soirée (/hd)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                    <input required type="text" value={editLocation} onChange={e=>setEditLocation(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                   <button type="button" onClick={() => setEditBooking(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                </div>
              </form>
           </div>
        </div>
      )}
'''
code = code.replace("</ClientLayout>", edit_modal + "\n    </ClientLayout>")

with open('frontend/src/pages/ClientDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Dashboard updated successfully!")
