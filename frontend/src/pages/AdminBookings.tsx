import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  PageHeader, PrimaryBtn, FilterTabs, SearchInput, TableShell, TH, TD, EmptyState,
  Avatar, Badge, Modal, DangerBtn, ConfirmDialog, Toast, GhostBtn
} from '../figma_templates/components';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  const [detailId, setDetailId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' } | null>(null);
  const [toast, setToast] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/staff/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      if (status === 'APPROVED') {
        await api.post(`/staff/bookings/${id}/approve`);
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          try {
            await api.post('/api/billing', {
              invoiceNumber: `INV-BKG-${id}`,
              booking: { id },
              amount: booking.estimated_total || 1000,
              status: 'Pending Payment',
              clientName: booking.customer_name || 'Client',
              eventName: booking.package_name || 'Event'
            });
          } catch (e) {
            console.error('Error generating invoice:', e);
          }
        }
      } else if (status === 'REJECTED') {
        await api.post(`/staff/bookings/${id}/reject`, { reason: 'Rejected by admin' });
      } else if (status === 'COMPLETED') {
        await api.post(`/staff/bookings/${id}/complete`);
      }
      
      setToast(`Booking marked as ${status.replace('_', ' ')}`);
      fetchBookings();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
      console.error(err);
    }
  };

  const filtered = bookings
    .filter(b => filter === 'ALL' || b.status === filter || (!b.status && filter === 'PENDING'))
    .filter(b => {
       if (!search) return true;
       const s = search.toLowerCase();
       const idStr = String(b.id || b.reference);
       const cust = (b.customer_name || 'Customer').toLowerCase();
       return idStr.includes(s) || cust.includes(s);
    });

  const detail = bookings.find(b => b.id === detailId);

  const actionLabels = { APPROVED: 'Approve', REJECTED: 'Reject', COMPLETED: 'Mark Completed', CANCELLED: 'Cancel' };
  const actionMessages = {
    APPROVED: 'This booking will be approved and the customer will be invoiced.',
    REJECTED: 'This booking will be rejected. This action cannot be undone.',
    COMPLETED: 'This booking will be marked as completed.',
    CANCELLED: 'This booking will be cancelled.',
  };

  const fmt = (v: number) => `Rs. ${Number(v || 0).toLocaleString()}`;

  return (
    <AdminLayout title="Bookings & Orders">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Bookings"
          subtitle={`${filtered.length} bookings`}
          breadcrumb={['Operations', 'Bookings']}
        />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED']} active={filter} onChange={setFilter} />
          <div className="ml-auto w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="Search bookings..." />
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <TH>Booking</TH>
              <TH>Customer</TH>
              <TH>Event Date</TH>
              <TH>Location</TH>
              <TH>Guests</TH>
              <TH>Package</TH>
              <TH right>Total</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><EmptyState title="No bookings found" message="Try adjusting your filters." /></td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <TD><span className="text-[10px] font-mono text-[var(--color-gold)]">{b.reference || `REF-${b.id}`}</span></TD>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={b.customer_name || 'Customer'} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">{b.customer_name || `User #${b.user_id}`}</div>
                      <div className="text-[10px] text-[var(--color-muted)]">{b.customer_email || 'No email provided'}</div>
                    </div>
                  </div>
                </TD>
                <TD>
                  <span className="text-sm font-mono text-[var(--color-ink)] whitespace-nowrap">{b.event_date || new Date(b.created_at).toLocaleDateString()}</span><br/>
                  <span className="text-[10px] text-[var(--color-muted)]">{b.event_time}</span>
                </TD>
                <TD><span className="text-sm text-[var(--color-muted)] max-w-[120px] block truncate">{b.event_location || 'N/A'}</span></TD>
                <TD><span className="font-mono text-sm">{b.guest_count || 0}</span></TD>
                <TD><span className="text-sm text-[var(--color-muted)]">{b.package_name || 'Custom'}</span></TD>
                <TD right><span className="font-display font-semibold text-sm text-[var(--color-ink)]">{fmt(b.estimated_total)}</span></TD>
                <TD><Badge label={b.status || 'PENDING'} /></TD>
                <TD>
                  <div className="flex items-center gap-1">
                    <GhostBtn onClick={() => setDetailId(b.id)} className="text-[10px] font-mono text-[var(--color-gold)] hover:underline">View</GhostBtn>
                    {(b.status === 'PENDING' || !b.status) && (
                      <>
                        <span className="text-[var(--color-border)]">•</span>
                        <GhostBtn onClick={() => setConfirmAction({ id: b.id, action: 'APPROVED' })} className="text-[10px] font-mono text-[var(--color-green)] hover:underline">Approve</GhostBtn>
                        <span className="text-[var(--color-border)]">•</span>
                        <GhostBtn onClick={() => setConfirmAction({ id: b.id, action: 'REJECTED' })} className="text-[10px] font-mono text-[var(--color-red)] hover:underline">Reject</GhostBtn>
                      </>
                    )}
                    {b.status === 'APPROVED' && (
                      <>
                        <span className="text-[var(--color-border)]">•</span>
                        <GhostBtn onClick={() => setConfirmAction({ id: b.id, action: 'COMPLETED' })} className="text-[10px] font-mono text-[var(--color-blue)] hover:underline">Complete</GhostBtn>
                      </>
                    )}
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableShell>

        {/* Detail modal */}
        {detail && (
          <Modal open={!!detailId} onClose={() => setDetailId(null)} title={`Booking REF-${detail.id}`} width="max-w-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-divider)]">
                <Avatar name={detail.customer_name || 'Customer'} size="lg" />
                <div>
                  <div className="font-semibold text-[var(--color-ink)]">{detail.customer_name || `User #${detail.user_id}`}</div>
                  <div className="text-sm text-[var(--color-muted)]">{detail.customer_email}</div>
                </div>
                <div className="ml-auto"><Badge label={detail.status || 'PENDING'} /></div>
              </div>
              {[
                ['Event Date', detail.event_date || new Date(detail.created_at).toLocaleDateString()],
                ['Event Time', detail.event_time],
                ['Location', detail.event_location || 'N/A'],
                ['Guest Count', `${detail.guest_count || 0} guests`],
                ['Package', detail.package_name || 'Custom'],
                ['Total', fmt(detail.estimated_total)],
                ['Submitted', new Date(detail.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted)]">{label}</span>
                  <span className="font-medium text-[var(--color-ink)]">{value}</span>
                </div>
              ))}
              {(detail.status === 'PENDING' || !detail.status) && (
                <div className="flex gap-3 pt-2">
                  <PrimaryBtn onClick={() => { setConfirmAction({ id: detail.id, action: 'APPROVED' }); setDetailId(null); }} className="flex-1">Approve</PrimaryBtn>
                  <DangerBtn onClick={() => { setConfirmAction({ id: detail.id, action: 'REJECTED' }); setDetailId(null); }} className="flex-1">Reject</DangerBtn>
                </div>
              )}
            </div>
          </Modal>
        )}

        {confirmAction && (
          <ConfirmDialog
            open={!!confirmAction}
            onClose={() => setConfirmAction(null)}
            onConfirm={() => { 
              handleStatusChange(confirmAction.id, confirmAction.action);
              setConfirmAction(null); 
            }}
            title={`${actionLabels[confirmAction.action]} booking?`}
            message={actionMessages[confirmAction.action]}
            danger={confirmAction.action === 'REJECTED' || confirmAction.action === 'CANCELLED'}
          />
        )}

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
