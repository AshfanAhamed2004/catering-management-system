import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import { WasteRecord, WasteSummary, WasteCategory, BookingOption } from '../types';
import {
  PageHeader, PrimaryBtn, KPICard, TableShell, TH, TD, GhostBtn, Modal,
  FormField, Input, Select, SecondaryBtn, Textarea, Toast, EmptyState
} from '../figma_templates/components';

export const AdminWasteTracker = () => {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [summary, setSummary] = useState<WasteSummary | null>(null);
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({ bookingId: '', startDate: '', endDate: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  
  // Form State
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState<WasteCategory | string>('SPOILAGE');
  const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingId, setBookingId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const fetchWaste = async () => {
    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams();
      if (filters.bookingId) query.append('bookingId', filters.bookingId);
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      
      const res = await api.get<WasteRecord[]>('/staff/waste?' + query.toString());
      setRecords(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get<WasteSummary>('/staff/waste/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await api.get('/staff/waste/booking-options');
      setBookingOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchWaste();
  }, [filters]);

  const openModal = (record?: any) => {
    if (record) {
      setEditingId(record.id);
      setIngredientName(record.ingredientName || record.ingredient_name || '');
      setQuantity(record.quantity);
      setUnit(record.unit);
      setCategory(record.category);
      setWasteDate(record.wasteDate || record.waste_date || new Date().toISOString().split('T')[0]);
      setBookingId(record.bookingId || record.booking_id ? String(record.bookingId || record.booking_id) : '');
      setNotes(record.notes || '');
    } else {
      setEditingId(null);
      setIngredientName('');
      setQuantity('');
      setUnit('kg');
      setCategory('SPOILAGE');
      setWasteDate(new Date().toISOString().split('T')[0]);
      setBookingId('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ingredient_name: ingredientName.trim(),
        quantity: Number(quantity),
        unit: unit.trim(),
        category,
        waste_date: wasteDate,
        booking_id: bookingId ? Number(bookingId) : null,
        notes: notes.trim()
      };

      if (editingId) {
        await api.put(`/staff/waste/${editingId}`, payload);
        setToast('Waste record updated.');
      } else {
        await api.post('/staff/waste', payload);
        setToast('Waste recorded.');
      }
      setIsModalOpen(false);
      fetchWaste();
      fetchSummary();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this waste record?')) return;
    try {
      await api.delete(`/staff/waste/${id}`);
      setToast('Record deleted.');
      fetchWaste();
      fetchSummary();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const byIngredientList = summary && (summary.byIngredient || (summary as any).by_ingredient) 
    ? Object.entries(summary.byIngredient || (summary as any).by_ingredient)
    : [];

  const topWasted = [...byIngredientList].sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  return (
    <AdminLayout title="Waste Tracker">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader 
          title="Waste Tracker" 
          subtitle="Monitor and reduce food waste" 
          breadcrumb={['Logistics', 'Waste']}
          action={<PrimaryBtn onClick={() => openModal()}>+ Log Waste</PrimaryBtn>}
        />

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            <KPICard label="Total Waste Quantity" value={`${summary.totalQuantity || (summary as any).total_quantity || 0} kg/L`} accent="var(--color-amber)" />
            <KPICard label="Waste Records" value={records.length} accent="var(--color-blue)" />
            <KPICard label="Most Wasted" value={topWasted ? topWasted[0] : 'N/A'} sub={topWasted ? `${topWasted[1]} units` : ''} accent="var(--color-red)" />
            <KPICard label="This Month" value={`${records.slice(0, 5).reduce((s, r) => s + r.quantity, 0)} units`} accent="var(--color-ink)" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-wrap gap-4 items-end mb-5">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1 block">Filter by Booking</label>
            <Select value={filters.bookingId} onChange={e => setFilters({ ...filters, bookingId: e.target.value })}>
              <option value="">All Bookings</option>
              {bookingOptions.map(o => (
                <option key={o.id} value={o.id}>{o.reference || `Booking #${o.id}`}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1 block">Start Date</label>
            <Input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-1 block">End Date</label>
            <Input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <SecondaryBtn onClick={() => setFilters({ bookingId: '', startDate: '', endDate: '' })}>Clear</SecondaryBtn>
        </div>

        {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl mb-4 text-sm">{error}</div>}

        <TableShell>
          <thead>
            <tr>
              <TH>Ingredient</TH>
              <TH>Category</TH>
              <TH right>Quantity</TH>
              <TH>Booking</TH>
              <TH>Date</TH>
              <TH>Recorded By</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-10 text-center text-sm text-[var(--color-muted)]">Loading records...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7}><EmptyState title="No waste records" message="Adjust filters or log new waste." /></td></tr>
            ) : records.map(w => (
              <tr key={w.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <TD><span className="text-sm font-medium text-[var(--color-ink)]">{w.ingredientName || (w as any).ingredient_name}</span></TD>
                <TD><span className="text-xs text-[var(--color-muted)]">{w.category}</span></TD>
                <TD right><span className="font-mono text-sm">{w.quantity} {w.unit}</span></TD>
                <TD><span className="text-[10px] font-mono text-[var(--color-muted)]">{w.bookingReference || (w as any).booking_reference || 'N/A'}</span></TD>
                <TD><span className="text-xs font-mono text-[var(--color-muted)]">{new Date(w.wasteDate || (w as any).waste_date).toLocaleDateString()}</span></TD>
                <TD><span className="text-xs text-[var(--color-muted)]">{w.recordedByName || (w as any).recorded_by_name || 'Staff'}</span></TD>
                <TD>
                  <div className="flex gap-1">
                    <GhostBtn onClick={() => openModal(w)}>Edit</GhostBtn>
                    <GhostBtn onClick={() => handleDelete(w.id)} className="text-[var(--color-red)]">Delete</GhostBtn>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableShell>

        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Waste Record' : 'Log Food Waste'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Ingredient Name" required>
              <Input value={ingredientName} onChange={e => setIngredientName(e.target.value)} placeholder="e.g. Tomatoes" required />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantity" required>
                <Input type="number" step="0.01" min="0.01" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="5.5" required />
              </FormField>
              <FormField label="Unit" required>
                <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg, L, units" required />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required>
                <Select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="SPOILAGE">Spoilage</option>
                  <option value="OVERPRODUCTION">Overproduction</option>
                  <option value="TRIMMINGS">Trimmings</option>
                  <option value="PLATE_WASTE">Plate Waste</option>
                  <option value="DROPPED_CONTAMINATED">Dropped/Contaminated</option>
                </Select>
              </FormField>
              <FormField label="Waste Date" required>
                <Input type="date" value={wasteDate} onChange={e => setWasteDate(e.target.value)} required />
              </FormField>
            </div>

            <FormField label="Associated Booking (Optional)">
              <Select value={bookingId} onChange={e => setBookingId(e.target.value)}>
                <option value="">None / General Operations</option>
                {bookingOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.reference || `Booking #${o.id}`}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Notes">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional context (optional)" rows={2} />
            </FormField>

            <div className="flex gap-3 pt-2">
              <PrimaryBtn type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Log Waste'}</PrimaryBtn>
              <SecondaryBtn type="button" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </form>
        </Modal>

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
