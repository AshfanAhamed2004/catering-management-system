import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '../components/ClientLayout';
import { api } from '../api';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      sessionStorage.setItem('catering_token', res.data.token);
      // Determine role from token or response (for simplicity assuming role is in response)
      const role = res.data.role;
      if (role === 'CUSTOMER') {
        navigate('/client/bookings');
      } else {
        navigate('/admin/bookings');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow border border-gray-200 mt-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Sign In to Smart Serve</h2>
          <p className="text-gray-600 mt-2">Manage your catering reservations</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
            Sign In
          </button>
        </form>
      </div>
    </ClientLayout>
  );
};