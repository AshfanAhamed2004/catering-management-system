import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../api';

export const AdminStaff = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/users').then(res => setUsers(res.data)).catch(console.error);
  }, []);

  return (
    <AdminLayout title="Staff & User Management">
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">System Users</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add New User</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-800 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">{u.role?.name || 'USER'}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button className="text-red-600 hover:underline">Deactivate</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={4} className="p-4 text-center">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};