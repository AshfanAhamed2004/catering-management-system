import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminBilling = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/billing');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = async (id: number) => {
    try {
      await api.put(`/api/billing/${id}/pay`);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Billing & Invoicing">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Invoice #</th>
                <th className="p-4 font-medium">Client / Event</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{inv.invoiceNumber || `INV-${inv.id}`}</td>
                  <td className="p-4 text-gray-600">{inv.clientName || 'Client'} - {inv.eventName || 'Event'}</td>
                  <td className="p-4 text-gray-800 font-semibold">${inv.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'Paid' ? 'bg-green-50 text-green-600' : 'text-yellow-600 bg-yellow-50'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {inv.status !== 'Paid' && (
                      <button onClick={() => handleMarkPaid(inv.id)} className="text-green-600 hover:underline">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No invoices generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};