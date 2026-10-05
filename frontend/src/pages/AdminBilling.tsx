import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  PageHeader, FilterTabs, SearchInput, KPICard, TableShell, TH, TD,
  Badge, GhostBtn, Toast, EmptyState, Modal, FormField, Input, PrimaryBtn, SecondaryBtn
} from '../figma_templates/components';

export const AdminBilling = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState('PENDING PAYMENT');

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/billing');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
      setToast('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setClientName('');
    setEventName('');
    setAmount('');
    setStatus('PENDING PAYMENT');
    setShowModal(true);
  };

  const openEdit = (inv: any) => {
    setEditId(inv.id);
    setClientName(inv.clientName || '');
    setEventName(inv.eventName || '');
    setAmount(inv.amount || '');
    setStatus(inv.status || 'PENDING PAYMENT');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      clientName,
      eventName,
      amount: Number(amount),
      status
    };

    try {
      if (editId) {
        await api.put(`/api/billing/${editId}`, payload);
        setToast('Invoice updated successfully.');
      } else {
        await api.post('/api/billing', payload);
        setToast('Invoice created successfully.');
      }
      setShowModal(false);
      fetchInvoices(); 
    } catch (err) {
      setToast('Error saving invoice.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await api.delete(`/api/billing/${id}`);
      setToast('Invoice deleted.');
      fetchInvoices();
    } catch (err) {
      setToast('Failed to delete invoice.');
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await api.put(`/api/billing/${id}/pay`);
      setToast('Invoice marked as Paid.');
      fetchInvoices();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleEventStatusChange = async (bookingId: number, status: string) => {
    if (!bookingId) return;
    try {
      if (status === 'COMPLETED') {
        await api.post(`/staff/bookings/${bookingId}/complete`);
        setToast('Event marked as completed.');
      } else if (status === 'APPROVED') {
        await api.post(`/staff/bookings/${bookingId}/approve`);
        setToast('Event status updated.');
      }
      fetchInvoices();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const fmt = (v: number) => `Rs. ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const normalizeStatus = (s: string) => (s || '').toUpperCase().replace(' ', '_');

  const filtered = invoices
    .filter(i => {
      if (filter === 'ALL') return true;
      const s = normalizeStatus(i.status);
      if (filter === 'PAID') return s === 'PAID';
      if (filter === 'PENDING') return s.includes('PENDING');
      return true;
    })
    .filter(i => {
       if (!search) return true;
       const q = search.toLowerCase();
       return (
         (i.invoiceNumber || '').toLowerCase().includes(q) ||
         (i.clientName || '').toLowerCase().includes(q) ||
         (i.eventName || '').toLowerCase().includes(q)
       );
    });

  const paidAmt = invoices.filter(i => normalizeStatus(i.status) === 'PAID').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const pendingAmt = invoices.filter(i => normalizeStatus(i.status).includes('PENDING')).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <AdminLayout title="Billing">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Billing"
          subtitle="Invoice management"
          breadcrumb={['Finance', 'Billing']}
          action={<PrimaryBtn onClick={openAdd}>+ Add Invoice</PrimaryBtn>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
          <KPICard label="Collected" value={fmt(paidAmt)} sub={`${invoices.filter(i => normalizeStatus(i.status) === 'PAID').length} paid invoices`} accent="var(--color-green)" />
          <KPICard label="Pending Receivables" value={fmt(pendingAmt)} sub={`${invoices.filter(i => normalizeStatus(i.status).includes('PENDING')).length} pending invoices`} accent="var(--color-amber)" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={['ALL', 'PAID', 'PENDING']} active={filter} onChange={setFilter} />
          <div className="ml-auto w-56">
            <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <TH>Invoice #</TH>
              <TH>Customer & Event</TH>
              <TH right>Amount</TH>
              <TH>Payment Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-sm text-[var(--color-muted)]">Loading invoices...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><EmptyState title="No invoices found" message="Try adjusting your filters or search." /></td></tr>
            ) : filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <TD><span className="text-[10px] font-mono text-[var(--color-ink)]">{inv.invoiceNumber || `INV-${inv.id}`}</span></TD>
                <TD>
                  <div className="text-sm font-medium text-[var(--color-ink)]">{inv.clientName || 'Client'}</div>
                  <div className="text-xs text-[var(--color-muted)]">{inv.eventName || 'Event'}</div>
                </TD>
                <TD right><span className="font-display font-semibold text-sm text-[var(--color-ink)]">{fmt(inv.amount)}</span></TD>
                <TD>
                  <Badge label={normalizeStatus(inv.status)} />
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    {normalizeStatus(inv.status) !== 'PAID' && (
                      <GhostBtn onClick={() => handleMarkPaid(inv.id)} className="text-[var(--color-green)]">Mark Paid</GhostBtn>
                    )}
                    <GhostBtn onClick={() => openEdit(inv)}>Edit</GhostBtn>
                    <GhostBtn onClick={() => handleDelete(inv.id)} className="text-[var(--color-red)]">Delete</GhostBtn>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableShell>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Invoice" : "Create Invoice"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Client Name" required>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} required />
            </FormField>
            <FormField label="Event Name">
              <Input value={eventName} onChange={e => setEventName(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (Rs.)" required>
                <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} required />
              </FormField>
              <FormField label="Status" required>
                <select 
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="PENDING PAYMENT">Pending Payment</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </FormField>
            </div>
            <div className="flex gap-3 pt-4">
              <PrimaryBtn type="submit" className="flex-1">{editId ? 'Update Invoice' : 'Create Invoice'}</PrimaryBtn>
              <SecondaryBtn type="button" onClick={() => setShowModal(false)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </form>
        </Modal>

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};