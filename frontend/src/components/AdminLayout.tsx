import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

type NavItem = { path: string; label: string; icon: React.ReactNode; section: string; roles: string[] | 'all' };

const navItems: NavItem[] = [
  {
    path: '/admin/bookings', label: 'Bookings', section: 'Operations',
    roles: ['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    path: '/admin/customers', label: 'Customers', section: 'Operations',
    roles: ['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    path: '/admin/feedback', label: 'Feedback', section: 'Operations',
    roles: ['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
  },
  {
    path: '/admin/inquiries', label: 'Customer Inquiries', section: 'Operations',
    roles: ['GENERAL_MANAGER', 'CUSTOMER_SERVICE_SUPERVISOR'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    path: '/admin/menu', label: 'Menu Engineering', section: 'Kitchen',
    roles: ['GENERAL_MANAGER', 'HEAD_CHEF'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    path: '/admin/packages', label: 'Packages', section: 'Kitchen',
    roles: ['GENERAL_MANAGER', 'HEAD_CHEF'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
  },
  {
    path: '/admin/forecast', label: 'Forecasting', section: 'Kitchen',
    roles: ['GENERAL_MANAGER', 'HEAD_CHEF'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
  },
  {
    path: '/admin/scheduling', label: 'Scheduling', section: 'Logistics',
    roles: ['GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    path: '/admin/inventory', label: 'Inventory', section: 'Logistics',
    roles: ['GENERAL_MANAGER', 'HEAD_CHEF', 'EVENT_COORDINATION_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
    ),
  },
  {
    path: '/admin/waste', label: 'Waste Tracker', section: 'Logistics',
    roles: ['GENERAL_MANAGER', 'HEAD_CHEF', 'EVENT_COORDINATION_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    ),
  },
  {
    path: '/admin/billing', label: 'Billing', section: 'Finance',
    roles: ['GENERAL_MANAGER', 'FINANCE_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
      </svg>
    ),
  },
  {
    path: '/admin/profitability', label: 'Profitability', section: 'Finance',
    roles: ['GENERAL_MANAGER', 'FINANCE_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
      </svg>
    ),
  },
  {
    path: '/admin/staff', label: 'Staff Management', section: 'Admin',
    roles: ['GENERAL_MANAGER', 'EVENT_COORDINATION_OFFICER'],
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    ),
  },
];

export const AdminLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const visibleItems = navItems.filter(item =>
    item.roles === 'all' ||
    (item.roles as string[]).includes(user.role)
  );
  
  const sections = ['Overview', 'Operations', 'Kitchen', 'Logistics', 'Finance', 'Admin'];
  
  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';

  const sidebarContent = (
    <>
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-gold)] rounded-lg flex items-center justify-center text-white font-display font-bold text-sm">S</div>
          <div>
            <div className="text-white font-display font-semibold text-base leading-none">Smart Serve Catering</div>
            <div className="text-[var(--color-gold)] text-[9px] font-mono uppercase tracking-[0.15em] mt-0.5">Catering Suite</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map(section => {
          const sectionItems = visibleItems.filter(i => i.section === section);
          if (!sectionItems.length) return null;
          return (
            <div key={section} className="mb-4">
              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/30 px-3 mb-1.5">{section}</div>
              {sectionItems.map(item => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all text-left group ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                    }`}
                  >
                    <span className={`transition-colors ${isActive ? 'text-[var(--color-gold)]' : 'text-white/40 group-hover:text-white/60'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-[var(--color-gold)]" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{user.email}</div>
            <div className="text-white/40 text-[10px] font-mono truncate">{user.role?.replace(/_/g, " ")}</div>
          </div>
          <button
            onClick={() => logout()}
            className="text-white/30 hover:text-white/60 transition-colors shrink-0"
            title="Sign out"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <aside className="hidden lg:flex w-56 shrink-0 bg-[var(--color-sidebar)] flex-col">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[var(--color-sidebar)] flex flex-col h-full">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-[var(--color-ink)] text-sm truncate">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
              <div className="w-7 h-7 rounded-full bg-[var(--color-gold)] text-white flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-medium text-[var(--color-ink)] leading-none">{user.email?.split(' ')[0]}</div>
                <div className="text-[10px] text-[var(--color-muted)] font-mono leading-none mt-0.5">{user.role?.replace(/_/g, " ")}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

