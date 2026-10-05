import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import { BillingMetricsOut } from '../types';
import {
  PageHeader, KPICard, SectionCard, PrimaryBtn, TableShell, TH, TD, GhostBtn, Modal, FormField, Input, SecondaryBtn, Toast
} from '../figma_templates/components';

export const AdminProfitability = () => {
  const [metrics, setMetrics] = useState<BillingMetricsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Expenses CRUD
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expName, setExpName] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expDate, setExpDate] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/api/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<BillingMetricsOut>('/api/billing/metrics');
      setMetrics(res.data);
      fetchExpenses();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setExpName('');
    setExpCategory('');
    setExpAmount('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEdit = (exp: any) => {
    setEditId(exp.id);
    setExpName(exp.name);
    setExpCategory(exp.category);
    setExpAmount(exp.amount);
    setExpDate(exp.date);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: expName,
      category: expCategory,
      amount: Number(expAmount),
      date: expDate
    };

    try {
      if (editId) {
        await api.put(`/api/expenses/${editId}`, payload);
        setToast('Expense updated successfully.');
      } else {
        await api.post('/api/expenses', payload);
        setToast('Expense created successfully.');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (err) {
      setToast('Error saving expense.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      setToast('Expense deleted.');
      fetchExpenses();
    } catch (err) {
      setToast('Failed to delete expense.');
    }
  };

  const fmt = (v: number | undefined | null) => {
    if (v === undefined || v === null) return "Rs. 0.00";
    return "Rs. " + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const m = metrics as any; // Allow snake_case fallbacks without TS complaining

  const paidRevenue = metrics ? (metrics.totalPaidRevenue || m.total_paid_revenue || 0) : 0;
  const pendingRevenue = metrics ? (metrics.pendingReceivables || m.pending_receivables || 0) : 0;
  const pipelineValue = metrics ? (metrics.pipelineBookingValue || m.pipeline_booking_value || 0) : 0;
  const avgBookingValue = metrics ? (metrics.averageBookingValue || m.average_booking_value || 0) : 0;
  const paidCount = metrics ? (metrics.paidInvoiceCount || m.paid_invoice_count || 0) : 0;
  const pendingCount = metrics ? (metrics.pendingInvoiceCount || m.pending_invoice_count || 0) : 0;

  const totalRevenue = paidRevenue + pendingRevenue;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = paidRevenue - totalExpenses;

  const statusBreakdown = [
    { label: 'Paid', value: paidRevenue, pct: totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0, color: 'var(--color-green)' },
    { label: 'Pending', value: pendingRevenue, pct: totalRevenue > 0 ? Math.round((pendingRevenue / totalRevenue) * 100) : 0, color: 'var(--color-amber)' }
  ];

  return (
    <AdminLayout title="Profitability">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader 
          title="Profitability" 
          subtitle="Financial overview & Expense tracking" 
          breadcrumb={['Finance', 'Profitability']}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex justify-between items-center text-sm font-medium">
            <span>{error}</span>
            <button onClick={fetchMetrics} className="hover:underline bg-white px-3 py-1 rounded border border-red-200">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 text-sm text-[var(--color-muted)]">
            Loading metrics...
          </div>
        ) : metrics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              <KPICard label="Net Profit (Cash)" value={fmt(netProfit)} sub="Paid Rev - Expenses" accent="var(--color-gold)" />
              <KPICard label="Total Paid Revenue" value={fmt(paidRevenue)} sub={`${paidCount} paid invoices`} accent="var(--color-green)" />
              <KPICard label="Total Expenses" value={fmt(totalExpenses)} sub={`${expenses.length} records`} accent="var(--color-red)" />
              <KPICard label="Pending Receivables" value={fmt(pendingRevenue)} sub={`${pendingCount} invoices`} accent="var(--color-amber)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <SectionCard title="Revenue by Status">
                <div className="space-y-4 mt-1">
                  {statusBreakdown.map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[var(--color-muted)]">{s.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold font-display text-[var(--color-ink)]">{fmt(s.value)}</span>
                          <span className="text-[10px] font-mono text-[var(--color-muted)]">{s.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
            
            <div className="pt-4 flex items-center justify-between">
              <h3 className="text-lg font-display text-[var(--color-ink)]">Expense Tracker</h3>
              <PrimaryBtn onClick={openAdd}>+ Add Expense</PrimaryBtn>
            </div>
            
            <TableShell>
              <thead>
                <tr>
                  <TH>Date</TH>
                  <TH>Expense Name</TH>
                  <TH>Category</TH>
                  <TH right>Amount</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-sm text-[var(--color-muted)]">No expenses recorded.</td></tr>
                ) : expenses.map(exp => (
                  <tr key={exp.id}>
                    <TD><span className="text-xs font-mono text-[var(--color-muted)]">{exp.date}</span></TD>
                    <TD><span className="text-sm font-medium text-[var(--color-ink)]">{exp.name}</span></TD>
                    <TD><span className="text-xs text-[var(--color-muted)]">{exp.category}</span></TD>
                    <TD right><span className="font-display font-semibold text-sm text-[var(--color-red)]">-{fmt(exp.amount)}</span></TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <GhostBtn onClick={() => openEdit(exp)}>Edit</GhostBtn>
                        <GhostBtn onClick={() => handleDelete(exp.id)} className="text-[var(--color-red)]">Delete</GhostBtn>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </>
        )}

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Expense" : "Log New Expense"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Expense Name" required>
              <Input value={expName} onChange={e => setExpName(e.target.value)} placeholder="e.g. Venue Rental" required />
            </FormField>
            <FormField label="Category" required>
              <Input value={expCategory} onChange={e => setExpCategory(e.target.value)} placeholder="e.g. Operations" required />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Amount (Rs.)" required>
                <Input type="number" min="0" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))} required />
              </FormField>
              <FormField label="Date" required>
                <Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} required />
              </FormField>
            </div>
            <div className="flex gap-3 pt-4">
              <PrimaryBtn type="submit" className="flex-1">{editId ? 'Update Expense' : 'Save Expense'}</PrimaryBtn>
              <SecondaryBtn type="button" onClick={() => setShowModal(false)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </form>
        </Modal>

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
