import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { useAuth, getDashboardRoute } from '../auth';
import { FormField, Input } from '../figma_templates/components';

// Extracted from Figma Auth.tsx
function AuthShell({
  title, subtitle, children, onNav, footer
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNav: (v: string) => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--color-sidebar)] flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1200&fit=crop&auto=format"
            alt="Fine dining"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative p-10 flex flex-col h-full">
          <button onClick={() => onNav('landing')} className="flex items-center gap-3 mb-auto">
            <div className="w-8 h-8 bg-[var(--color-gold)] rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">S</div>
            <div>
              <div className="text-white font-display font-semibold text-base leading-none">Smart Serve Catering</div>
              <div className="text-[var(--color-gold)] text-[9px] font-mono uppercase tracking-[0.15em]">Fine Catering</div>
            </div>
          </button>
          <div className="mt-auto">
            <blockquote className="text-white/70 text-lg font-display font-light italic leading-relaxed mb-6">
              "We don't just cater events — we craft experiences that linger long after the last course."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-gold)]/30 border border-[var(--color-gold)]/50 flex items-center justify-center text-[var(--color-gold)] text-sm font-semibold">JB</div>
              <div>
                <div className="text-white text-sm font-medium">Jean Bouchard</div>
                <div className="text-white/40 text-[10px] font-mono">Executive Chef & Founder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button onClick={() => onNav('landing')} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-[var(--color-green)] rounded flex items-center justify-center text-white font-display font-bold text-xs">S</div>
            <span className="font-display font-semibold text-[var(--color-ink)]">Smart Serve Catering</span>
          </button>
          <h1 className="font-display font-semibold text-3xl text-[var(--color-ink)] mb-2">{title}</h1>
          <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">{subtitle}</p>
          {children}
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export const AuthPage = () => {
  const [tab, setTab] = useState<'customer' | 'staff'>('customer');
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const from = location.state?.from || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const user = await login(email, password);
        if (tab === 'staff' && user.role === 'CUSTOMER') {
          await logout();
          setError('This account is registered as a Customer. Please use the Customer login.');
          setLoading(false);
          return;
        }
        if (tab === 'customer' && user.role !== 'CUSTOMER') {
          await logout();
          setError('This account is registered as Staff. Please use the Staff login.');
          setLoading(false);
          return;
        }
        navigate(from || getDashboardRoute(user.role), { replace: true });
      } else {
        if (password !== passwordConfirmation) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await api.post('/auth/register', { 
          email: email, 
          password: password, 
          password_confirmation: passwordConfirmation, 
          full_name: fullName, 
          mobile_number: mobileNumber, 
          address: address 
        });
        
        const user = await login(email, password);
        navigate(getDashboardRoute(user.role), { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      if (isLogin) {
         setError(tab === 'staff' ? 'Invalid staff credentials.' : 'Invalid email or password.');
      } else {
         setError(errorMessage(err) || 'Registration failed. Please check your inputs.');
      }
      setLoading(false);
    }
  };

  const handleNav = (v: string) => {
    if (v === 'landing') navigate('/');
    if (v === 'register') setIsLogin(false);
    if (v === 'login') setIsLogin(true);
  };

  return (
    <AuthShell
      title={isLogin ? (tab === 'staff' ? 'Staff sign in' : 'Welcome back') : 'Create an account'}
      subtitle={isLogin 
        ? (tab === 'staff' ? 'Sign in to access your management dashboard.' : 'Sign in to view your bookings and events.') 
        : 'Sign up to start planning your perfect event.'}
      onNav={handleNav}
      footer={
        <p className="text-center text-xs text-[var(--color-muted)]">
          {isLogin ? (
             tab === 'customer' ? (
                <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-[var(--color-gold)] hover:underline font-medium">Create one</button></>
             ) : (
                <>Staff accounts are provisioned internally.</>
             )
          ) : (
            <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-[var(--color-gold)] hover:underline font-medium">Sign in</button></>
          )}
        </p>
      }
    >
      {/* Mode toggle */}
      <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-1 mb-6">
        {(['customer', 'staff'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setTab(m); setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${tab === m ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-muted)]'}`}
          >
            {m === 'staff' ? '👔 Staff' : '👤 Customer'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && tab === 'customer' && (
          <>
             <FormField label="Full Name" required>
               <Input placeholder="e.g. Jean Bouchard" value={fullName} onChange={e => setFullName(e.target.value)} required />
             </FormField>
             <div className="grid grid-cols-2 gap-4">
               <FormField label="Mobile Number" required>
                 <Input type="tel" placeholder="(555) 000-0000" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} required />
               </FormField>
               <FormField label="Address" required>
                 <Input placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} required />
               </FormField>
             </div>
          </>
        )}

        <FormField label="Email" required>
          <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </FormField>
        
        <FormField label="Password" required>
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isLogin ? "current-password" : "new-password"} />
        </FormField>

        {!isLogin && tab === 'customer' && (
          <FormField label="Confirm Password" required>
            <Input type="password" placeholder="Repeat password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required />
          </FormField>
        )}

        {error && (
          <div className="bg-[var(--color-red-light)] border border-[var(--color-red)]/30 rounded-lg px-3 py-2.5 text-xs text-[var(--color-red)] flex items-start gap-2">
            <span>⚠️ </span>
            <span>{error}</span>
          </div>
        )}

        {isLogin && (
          <button type="button" className="text-xs text-[var(--color-gold)] hover:underline block text-right w-full">
            Forgot password?
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-green)] text-white font-medium py-3 rounded-xl hover:bg-[var(--color-sidebar-hover)] transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
          ) : (isLogin ? 'Sign in' : 'Create account')}
        </button>
      </form>
    </AuthShell>
  );
};
