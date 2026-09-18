import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminPackages = () => {
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/catalog/packages').then(res => setPackages(res.data)).catch(console.error);
  }, []);

  return (
    <AdminLayout title="Catering Packages">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Combine menu items into ready-to-sell packages.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Create Package</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600&auto=format&fit=crop')" }}></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{pkg.name}</h3>
                <span className="font-bold text-blue-700 whitespace-nowrap ml-2">${pkg.pricePerGuest} / guest</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-1">{pkg.description}</p>
              <div className="flex gap-2 mt-auto">
                <button className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 flex-1">Edit</button>
                <button className="bg-gray-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-50">Archive</button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p className="text-gray-500">No packages found.</p>}
      </div>
    </AdminLayout>
  );
};