
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminBilling.tsx", "utf8");

// Add handleEventStatusChange
const newFunc = `
  const handleEventStatusChange = async (bookingId: number, status: string) => {
    if (!bookingId) return;
    try {
      if (status === 'COMPLETED') {
        await api.post(\`/staff/bookings/\${bookingId}/complete\`);
      } else if (status === 'APPROVED') {
        await api.post(\`/staff/bookings/\${bookingId}/approve\`);
      }
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
`;
code = code.replace(/return \(\s*/, newFunc);

// Update Actions Column
const oldActions = `<td className="p-4">
                    {inv.status !== 'Paid' && (
                      <button onClick={() => handleMarkPaid(inv.id)} className="text-green-600 hover:underline">Mark Paid</button>
                    )}
                  </td>`;

const newActions = `<td className="p-4">
                    <div className="flex flex-col gap-2">
                      {inv.status !== 'Paid' && (
                        <button onClick={() => handleMarkPaid(inv.id)} className="text-green-600 hover:underline text-left">Mark Paid</button>
                      )}
                      {inv.booking_id && (
                        <select 
                          value={inv.booking_status}
                          onChange={(e) => handleEventStatusChange(inv.booking_id, e.target.value)}
                          className={\`text-xs p-1 border rounded cursor-pointer w-32 \${inv.booking_status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}\`}
                        >
                          <option value="APPROVED">Upcoming Event</option>
                          <option value="COMPLETED">Event Completed</option>
                        </select>
                      )}
                    </div>
                  </td>`;
                  
code = code.replace(oldActions, newActions);

fs.writeFileSync("frontend/src/pages/AdminBilling.tsx", code);

