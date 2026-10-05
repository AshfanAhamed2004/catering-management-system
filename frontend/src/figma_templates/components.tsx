import React, { useState, useEffect, useRef } from 'react';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const badgeMap: Record<string, string> = {
  approved: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  confirmed: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  completed: 'bg-[var(--color-blue-light)] text-[var(--color-blue)] border border-[var(--color-blue-light)]',
  responded: 'bg-[var(--color-blue-light)] text-[var(--color-blue)] border border-[var(--color-blue-light)]',
  paid: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  available: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  good: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  active: 'bg-[var(--color-green-light)] text-[var(--color-green)] border border-[var(--color-green-light)]',
  scheduled: 'bg-[var(--color-blue-light)] text-[var(--color-blue)] border border-[var(--color-blue-light)]',
  pending: 'bg-[var(--color-amber-light)] text-[var(--color-amber)] border border-[var(--color-amber-light)]',
  assigned: 'bg-[var(--color-amber-light)] text-[var(--color-amber)] border border-[var(--color-amber-light)]',
  low: 'bg-[var(--color-amber-light)] text-[var(--color-amber)] border border-[var(--color-amber-light)]',
  rejected: 'bg-[var(--color-red-light)] text-[var(--color-red)] border border-[var(--color-red-light)]',
  cancelled: 'bg-[var(--color-red-light)] text-[var(--color-red)] border border-[var(--color-red-light)]',
  overdue: 'bg-[var(--color-red-light)] text-[var(--color-red)] border border-[var(--color-red-light)]',
  critical: 'bg-[var(--color-red-light)] text-[var(--color-red)] border border-[var(--color-red-light)]',
  inactive: 'bg-[var(--color-border)] text-[var(--color-muted)] border border-[var(--color-border)]',
  off: 'bg-[var(--color-border)] text-[var(--color-muted)] border border-[var(--color-border)]',
};

export function Badge({ label, size = 'sm' }: { label: string; size?: 'sm' | 'xs' }) {
  const cls = badgeMap[label] ?? 'bg-[var(--color-border)] text-[var(--color-muted)] border border-[var(--color-border)]';
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 font-mono font-medium uppercase tracking-wider whitespace-nowrap
      ${size === 'xs' ? 'text-[10px]' : 'text-[11px]'}
      ${cls}`}>
      {label}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

export function KPICard({
  label, value, sub, accent = 'var(--color-ink)', onClick
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-2 transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">{label}</div>
      <div className="text-2xl font-display font-semibold leading-none" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-[var(--color-muted)]">{sub}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  open, onClose, title, children, width = 'max-w-lg'
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[var(--color-surface)] rounded-xl shadow-2xl w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-display font-semibold text-[var(--color-ink)] text-lg">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-bg)] transition-colors text-lg leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, danger = false
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-display font-semibold text-[var(--color-ink)] text-lg mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${danger ? 'bg-[var(--color-red)] text-white hover:opacity-90' : 'bg-[var(--color-green)] text-white hover:bg-[var(--color-sidebar-hover)]'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({ message, type = 'success', onDismiss }: { message: string; type?: 'success' | 'error' | 'info'; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: 'bg-[var(--color-green)] text-white',
    error: 'bg-[var(--color-red)] text-white',
    info: 'bg-[var(--color-blue)] text-white',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium ${colors[type]} animate-in slide-in-from-bottom-4`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100 ml-1 text-base leading-none">×</button>
    </div>
  );
}

// ─── Search Input ──────────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] w-full transition-colors"
      />
    </div>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────

export function FormField({
  label, error, children, required
}: {
  label: string; error?: string; children: React.ReactNode; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5">
        {label}{required && <span className="text-[var(--color-red)] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[var(--color-red)]">{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-colors ${className}`}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-colors appearance-none ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-colors resize-none ${className}`}
    />
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function PrimaryBtn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-green)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-sidebar-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] text-sm font-medium rounded-lg hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

export function DangerBtn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-red)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

export function GhostBtn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  let themeClass = 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white';
  
  if (className.includes('var(--color-red)') || className.includes('text-red')) {
    themeClass = 'bg-[var(--color-red)]/10 text-[var(--color-red)] hover:bg-[var(--color-red)] hover:text-white';
  } else if (className.includes('var(--color-green)') || className.includes('text-green')) {
    themeClass = 'bg-[var(--color-green)]/10 text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white';
  } else if (className.includes('var(--color-blue)') || className.includes('text-blue')) {
    themeClass = 'bg-[var(--color-blue)]/10 text-[var(--color-blue)] hover:bg-[var(--color-blue)] hover:text-white';
  }

  // Remove the old text color class so it doesn't conflict with our hover state
  const cleanedClassName = className.replace(/text-\[var\(--color-[a-z]+\)\]/g, '').replace(/text-red-[0-9]+/, '');

  return (
    <button 
      {...props} 
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded transition-colors disabled:opacity-50 ${themeClass} ${cleanedClassName}`}
    >
      {children}
    </button>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

export function FilterTabs({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wide transition-colors ${active === opt ? 'bg-[var(--color-green)] text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

export function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} ${star <= (hover || value) ? 'text-[var(--color-gold)]' : 'text-[var(--color-border)]'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon = '○', title, message }: { icon?: string; title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl text-[var(--color-border)] mb-4">{icon}</div>
      <div className="font-display font-semibold text-[var(--color-ink)] mb-1">{title}</div>
      {message && <div className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">{message}</div>}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-[var(--color-border)] rounded animate-pulse ${className}`} />;
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, breadcrumb, action
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-7 gap-4">
      <div>
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1.5">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-[var(--color-gold)]' : ''}>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-3xl font-display font-semibold text-[var(--color-ink)] leading-tight">{title}</h1>
        {subtitle && <p className="text-[var(--color-muted)] mt-1 text-sm font-light">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Table Shell ──────────────────────────────────────────────────────────────

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TH({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] bg-[var(--color-bg)] border-b border-[var(--color-border)] ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

export function TD({ children, right = false, className = '' }: { children: React.ReactNode; right?: boolean; className?: string }) {
  return (
    <td className={`px-4 py-3.5 border-b border-[var(--color-divider)] ${right ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <span className="text-xs font-mono text-[var(--color-muted)]">
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 rounded text-xs border border-[var(--color-border)] text-[var(--color-muted)] disabled:opacity-40 hover:text-[var(--color-ink)] transition-colors">Prev</button>
        <button disabled={page === pages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 rounded text-xs border border-[var(--color-border)] text-[var(--color-muted)] disabled:opacity-40 hover:text-[var(--color-ink)] transition-colors">Next</button>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function Avatar({ name, size = 'md', color = 'var(--color-green)' }: { name: string; size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

export function SectionCard({
  title, action, children, noPad = false
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-divider)]">
          {title && <h2 className="font-display font-semibold text-[var(--color-ink)] text-sm">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex border-b border-[var(--color-border)] mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            active === tab
              ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────

export function AlertBanner({ type, message }: { type: 'warning' | 'error' | 'info'; message: string }) {
  const styles = {
    warning: 'bg-[var(--color-amber-light)] border-[var(--color-amber)] text-[var(--color-amber)]',
    error: 'bg-[var(--color-red-light)] border-[var(--color-red)] text-[var(--color-red)]',
    info: 'bg-[var(--color-blue-light)] border-[var(--color-blue)] text-[var(--color-blue)]',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      <span>{type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}
