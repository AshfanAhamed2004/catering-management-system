import { useEffect, useState, type ReactNode } from 'react';
import { api, errorMessage } from './api';
import type { Status } from './types';

export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api.get<T>(path, {signal: controller.signal}).then(r => setData(r.data)).catch(e => {
      if (!controller.signal.aborted) setError(errorMessage(e));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, version]);
  return {data, loading, error, reload: () => setVersion(v => v + 1)};
}
export function LoadState({loading, error, reload, children}: {loading: boolean; error: string; reload: () => void; children: ReactNode}) {
  if (loading) return <div className="empty" role="status">Preparing your table…</div>;
  if (error) return <div className="empty" role="alert"><p>{error}</p><button onClick={reload}>Try again</button></div>;
  return children;
}
export function ErrorNote({message}: {message: string}) { return message ? <p role="alert" className="error">{message}</p> : null; }
export function Field({label, children}: {label: string; children: ReactNode}) { return <label className="field"><span>{label}</span>{children}</label>; }
export function StatusBadge({status}: {status: Status}) { return <span className={`badge ${status.toLowerCase()}`}>{status.toLowerCase()}</span>; }
export function PageTitle({eyebrow, title, children}: {eyebrow?: string; title: string; children?: ReactNode}) { return <div className="page-title"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>{children}</div>; }
export function Pager({page, setPage, count}: {page: number; setPage: (value: number) => void; count: number}) { return <div className="pager"><button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page + 1}</span><button className="secondary" disabled={count < 50} onClick={() => setPage(page + 1)}>Next</button></div>; }
export const money = (value: string | number) => new Intl.NumberFormat('en-LK', {style: 'currency', currency: 'LKR', maximumFractionDigits: 2}).format(Number(value));
export const displayDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-LK', {day: 'numeric', month: 'short', year: 'numeric'});
export function tomorrow() { const now = new Date(); const parts = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now); const part = (type: string) => parts.find(p => p.type === type)!.value; const date = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0,10); }
