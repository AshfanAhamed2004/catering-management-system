import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { api, errorMessage } from './api';
import type { Role, User } from './types';

interface AuthState { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<User>; logout: () => Promise<void> }
const Context = createContext<AuthState | null>(null);
export function AuthProvider({ children }: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const expired = () => { setUser(null); };
    window.addEventListener('session-expired', expired);
    if (sessionStorage.getItem('catering_token')) api.get<User>('/auth/me').then(r => setUser(r.data)).catch(e => setError(errorMessage(e))).finally(() => setLoading(false));
    else setLoading(false);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  async function login(email: string, password: string) {
    const { data } = await api.post<{access_token: string}>('/auth/login', {email, password});
    sessionStorage.setItem('catering_token', data.access_token);
    try { const identity = (await api.get<User>('/auth/me')).data; setUser(identity); setError(''); return identity; }
    catch (e) { sessionStorage.removeItem('catering_token'); throw e; }
  }
  async function logout() {
    try { await api.post('/auth/logout'); }
    catch { setError('Signed out on this device. Server logout could not be confirmed; other sessions expire automatically.'); }
    finally { sessionStorage.removeItem('catering_token'); setUser(null); }
  }
  return <Context.Provider value={{user, loading, login, logout}}>{error && <div className="notice" role="alert">{error} <button onClick={() => setError('')}>Dismiss</button></div>}{children}</Context.Provider>;
}
export function useAuth() { const context = useContext(Context); if (!context) throw new Error('AuthProvider missing'); return context; }

export const catalogRoles: Role[] = ['HEAD_CHEF', 'GENERAL_MANAGER'];
export const reviewRoles: Role[] = ['CUSTOMER_SERVICE_SUPERVISOR', 'GENERAL_MANAGER'];

export function getDashboardRoute(role: Role): string {
  switch (role) {
    case 'CUSTOMER': return '/client/bookings';
    case 'GENERAL_MANAGER': return '/admin/bookings';
    case 'FINANCE_OFFICER': return '/admin/billing';
    case 'CUSTOMER_SERVICE_SUPERVISOR': return '/admin/bookings';
    case 'HEAD_CHEF': return '/admin/menu';
    case 'EVENT_COORDINATION_OFFICER': return '/admin/scheduling';
    default: return '/no-access';
  }
}

export function ProtectedRoute({ roles, children }: {roles?: Role[]; children: ReactNode}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status">Loading your account...</p>;
  if (!user) return <Navigate to="/login" state={{from: location.pathname + location.search}} replace/>;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }
  return <>{children}</>;
}

