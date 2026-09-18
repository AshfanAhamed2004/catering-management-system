import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminMenuEngineering = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/catalog/menu').then(res => setItems(res.data)).catch(console.error);
  }, []);

  return (
    <AdminLayout title="Menu Engineering">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Culinary Items & Courses</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add Dish</button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">Manage individual dishes, ingredients, and pricing here.</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map(item => (
              <div key={item.id} className="border border-gray-200 rounded p-4">
                <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                <p className="text-sm text-gray-700 mb-3">Cost: ${item.costPrice} • Selling: ${item.sellingPrice}</p>
                <button className="text-blue-600 text-sm font-medium hover:underline">Edit Recipe</button>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-500">No menu items found.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};