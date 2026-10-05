import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  Tabs, SectionCard, TableShell, TH, TD, EmptyState,
  Avatar, Badge, StarRating
} from '../figma_templates/components';
import type { Customer360Out } from '../types';

export const AdminCustomer360 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Customer360Out | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');

  const fetchCustomer360 = async () => {
    if (!id) {
      setError('Invalid customer ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get<Customer360Out>(`/staff/customers/${id}`);
      setData(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer360();
  }, [id]);

  const toggleActive = async () => {
    try {
      const res = await api.post(`/staff/customers/${id}/toggle-active`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle status");
    }
  };

  const fmt = (v: number) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (error || !id) {
    return (
      <AdminLayout title="Customer 360">
        <div className="bg-red-50 text-red-600 p-4 rounded shadow-sm border border-red-200 mt-6 max-w-5xl mx-auto">
          <p className="font-semibold mb-2">Error loading customer data</p>
          <p className="mb-4">{error || 'Customer ID missing'}</p>
          <div className="flex gap-3">
            <button onClick={fetchCustomer360} className="bg-white px-4 py-2 rounded text-red-700 border border-red-200 hover:bg-red-100 font-medium text-sm">
              Retry
            </button>
            <button onClick={() => navigate('/admin/customers')} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium text-sm">
              Back to Customers
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Customer 360">
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors mb-5">
          ← Back to Customers
        </button>

        {loading || !data ? (
          <div className="text-center py-20 text-[var(--color-muted)] text-sm">Loading profile...</div>
        ) : (
          <>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <Avatar name={data.profile.full_name || 'Customer'} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="font-display font-semibold text-2xl text-[var(--color-ink)]">{data.profile.full_name}</h1>
                    <button onClick={toggleActive} className="hover:opacity-80 transition-opacity">
                      <Badge label={data.profile.active ? 'ACTIVE' : 'INACTIVE'} />
                    </button>
                  </div>
                  <div className="text-sm text-[var(--color-muted)]">{data.profile.email} • {data.profile.mobile_number || 'No phone'}</div>
                  <div className="text-xs text-[var(--color-muted)] mt-1">Customer since {new Date(data.profile.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6 shrink-0">
                <div className="text-center">
                  <div className="font-display font-semibold text-xl text-[var(--color-ink)]">{data.metrics.total_bookings}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-semibold text-xl text-[var(--color-green)]">{fmt(data.metrics.pipeline_booking_value)}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Pipeline</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-semibold text-xl text-[var(--color-blue)]">{data.feedback.length}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">Reviews</div>
                </div>
              </div>
            </div>

            <Tabs tabs={['Overview', 'Bookings', 'Feedback', 'Invoices']} active={tab} onChange={setTab} />

            {tab === 'Overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SectionCard title="Contact Details">
                  {[
                    ['Email', data.profile.email], 
                    ['Phone', data.profile.mobile_number || 'N/A'], 
                    ['Address', data.profile.address || 'N/A'],
                    ['Customer Since', new Date(data.profile.created_at).toLocaleDateString()]
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[var(--color-divider)] last:border-0">
                      <span className="text-[var(--color-muted)]">{k}</span>
                      <span className="font-medium text-[var(--color-ink)]">{v}</span>
                    </div>
                  ))}
                </SectionCard>
                <SectionCard title="Metrics">
                  {[
                    ['Total Bookings', data.metrics.total_bookings.toString()], 
                    ['Completed Bookings', data.metrics.completed_bookings.toString()], 
                    ['Cancelled Bookings', data.metrics.cancelled_bookings.toString()], 
                    ['Pipeline Value', fmt(data.metrics.pipeline_booking_value)]
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1.5 border-b border-[var(--color-divider)] last:border-0">
                      <span className="text-[var(--color-muted)]">{k}</span>
                      <span className="font-semibold text-[var(--color-ink)]">{v}</span>
                    </div>
                  ))}
                </SectionCard>
              </div>
            )}

            {tab === 'Bookings' && (
              <TableShell>
                <thead><tr><TH>Reference</TH><TH>Event Date</TH><TH>Package</TH><TH right>Guests</TH><TH>Location</TH><TH right>Total</TH><TH>Status</TH></tr></thead>
                <tbody>
                  {data.bookings.length === 0 ? <tr><td colSpan={7}><EmptyState title="No bookings" message="This customer hasn't booked anything yet." /></td></tr>
                    : data.bookings.map(b => (
                      <tr key={b.id} className="hover:bg-[var(--color-bg)] transition-colors">
                        <TD><span className="text-[10px] font-mono text-[var(--color-gold)]">{b.reference}</span></TD>
                        <TD><span className="text-sm font-mono text-[var(--color-ink)] whitespace-nowrap">{new Date(b.event_date).toLocaleDateString()}</span></TD>
                        <TD><span className="text-sm text-[var(--color-muted)]">{b.package_name || '-'}</span></TD>
                        <TD right><span className="font-mono text-sm">{b.guest_count}</span></TD>
                        <TD><span className="text-sm text-[var(--color-muted)] max-w-[150px] block truncate">{b.event_location || '-'}</span></TD>
                        <TD right><span className="font-display font-semibold text-sm text-[var(--color-ink)]">{fmt(b.estimated_total)}</span></TD>
                        <TD><Badge label={b.status} /></TD>
                      </tr>
                  ))}
                </tbody>
              </TableShell>
            )}

            {tab === 'Feedback' && (
              <div className="space-y-4">
                {data.feedback.length === 0
                  ? <EmptyState title="No feedback yet" message="This customer hasn't submitted any feedback." />
                  : data.feedback.map(fb => (
                    <SectionCard key={fb.id}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <StarRating value={fb.rating} readonly />
                          <div className="text-[10px] font-mono text-[var(--color-muted)] mt-1">
                            REF-{fb.booking_reference} • {fb.categories?.join(', ') || 'General'} • {new Date(fb.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge label={fb.status || 'SUBMITTED'} />
                      </div>
                      <p className="text-sm text-[var(--color-ink)] leading-relaxed mb-3">"{fb.comment}"</p>
                      {fb.staff_response && (
                        <div className="bg-[var(--color-bg)] rounded-lg px-4 py-3 border-l-2 border-[var(--color-green)]">
                          <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1">Staff Response</div>
                          <p className="text-sm text-[var(--color-muted)]">{fb.staff_response}</p>
                        </div>
                      )}
                    </SectionCard>
                  ))
                }
              </div>
            )}

            {tab === 'Invoices' && (
              <TableShell>
                <thead><tr><TH>Invoice #</TH><TH>Event</TH><TH right>Amount</TH><TH>Created</TH><TH>Status</TH></tr></thead>
                <tbody>
                  {data.invoices.length === 0 ? <tr><td colSpan={5}><EmptyState title="No invoices" message="No billing records for this customer." /></td></tr>
                    : data.invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-[var(--color-bg)] transition-colors">
                        <TD><span className="text-[10px] font-mono text-[var(--color-ink)]">{inv.invoice_number}</span></TD>
                        <TD><span className="text-sm text-[var(--color-muted)]">{inv.event_name || '-'}</span></TD>
                        <TD right><span className="font-display font-semibold text-sm text-[var(--color-ink)]">{fmt(inv.amount)}</span></TD>
                        <TD><span className="text-sm font-mono text-[var(--color-muted)]">{new Date(inv.created_at).toLocaleDateString()}</span></TD>
                        <TD><Badge label={inv.status} /></TD>
                      </tr>
                  ))}
                </tbody>
              </TableShell>
            )}

          </>
        )}
      </div>
    </AdminLayout>
  );
};
