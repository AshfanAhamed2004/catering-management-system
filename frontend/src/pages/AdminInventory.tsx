import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminInventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [quantity, setQuantity] = useState(0);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/inventory', {
        name, category, totalQuantity: quantity, availableQuantity: quantity, maintenanceStatus: 'Good'
      });
      setName('');
      setQuantity(0);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Inventory & Resources">
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
        <h3 className="font-semibold text-gray-700 mb-4">Add New Item</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Item Name</label>
            <input required value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full p-2 border rounded text-sm" placeholder="e.g. Gold Chair" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
              <option>Furniture</option>
              <option>Tableware</option>
              <option>Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
            <input required value={quantity} onChange={e=>setQuantity(Number(e.target.value))} type="number" className="w-full p-2 border rounded text-sm w-24" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add Item</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Equipment Stock</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Total Quantity</th>
                <th className="p-4 font-medium">Available</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{item.name}</td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4 text-gray-600">{item.totalQuantity}</td>
                  <td className="p-4 text-green-600 font-medium">{item.availableQuantity}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No inventory items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};