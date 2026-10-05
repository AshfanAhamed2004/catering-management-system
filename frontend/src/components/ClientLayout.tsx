import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export const ClientLayout = ({ children, title, fullWidth = false }: { children: React.ReactNode, title?: string, fullWidth?: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Extract initials if user exists
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans flex flex-col">
      <nav className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[var(--color-green)] rounded-md flex items-center justify-center text-white font-display font-bold text-xs">S</div>
            <span className="font-display font-semibold text-[var(--color-ink)] text-sm">Smart Serve Catering</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/" className="hidden md:block text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors px-3">
                  Request Booking
                </Link>
                <Link to="/client/bookings" className="hidden md:block text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors px-3">
                  My Bookings
                </Link>
                <Link to="/client/inquiries" className="hidden md:block text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors px-3 border-r border-[var(--color-border)] pr-5 mr-2">
                  Support Inquiries
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
                  <div>
                    <div className="text-xs font-medium text-[var(--color-ink)] leading-none">{user.email}</div>
                    <div className="text-[10px] font-mono text-[var(--color-muted)]">Customer Account</div>
                  </div>
                </div>
                <button onClick={logout} className="hidden md:block text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] border border-[var(--color-border)] px-3 py-1.5 rounded-lg transition-colors">
                  Sign Out
                </button>
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[var(--color-muted)]">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden md:block text-xs text-white bg-[var(--color-green)] hover:bg-[var(--color-sidebar-hover)] px-4 py-1.5 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
        
        {menuOpen && user && (
          <div className="md:hidden px-5 pb-4 border-t border-[var(--color-border)] pt-3 flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
               <div className="text-[var(--color-ink)] font-medium">{user.email}</div>
            </div>
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-[var(--color-ink)] font-medium">Request Booking</Link>
            <Link to="/client/bookings" onClick={() => setMenuOpen(false)} className="text-[var(--color-ink)] font-medium">My Bookings</Link>
            <Link to="/client/inquiries" onClick={() => setMenuOpen(false)} className="text-[var(--color-ink)] font-medium">Support Inquiries</Link>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-[var(--color-red)] font-medium pt-2 border-t border-[var(--color-divider)]">Sign Out</button>
          </div>
        )}
      </nav>
      
      <main className={`flex-1 ${fullWidth ? 'w-full' : 'max-w-5xl mx-auto px-5 py-8 w-full'}`}>
        {title && <h2 className="text-2xl font-display font-semibold text-[var(--color-ink)] mb-6">{title}</h2>}
        {children}
      </main>
    </div>
  );
};
