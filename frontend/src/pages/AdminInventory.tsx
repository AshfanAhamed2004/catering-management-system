import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  PageHeader, PrimaryBtn, FilterTabs, SearchInput, KPICard,
  TableShell, TH, TD, Badge, Modal, FormField, Input, Select, SecondaryBtn, Toast, EmptyState
} from '../figma_templates/components';

export const AdminInventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [mStatus, setMStatus] = useState('GOOD');

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setToast('Failed to load inventory.');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setName('');
    setCategory('Vegetables');
    setQuantity('');
    setMStatus('GOOD');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name || '');
    setCategory(item.category || 'Vegetables');
    setQuantity(item.total_quantity || item.totalQuantity || '');
    setMStatus(normalizeStatus(item.maintenance_status || item.maintenanceStatus || 'GOOD'));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || quantity === '') {
      setToast('Name and quantity are required.');
      return;
    }
    
    // Auto-calculate if they are adding new and didn't touch status, but allow manual override
    let finalStatus = mStatus;
    if (!editId && mStatus === 'GOOD') {
      if (quantity < 10) finalStatus = 'CRITICAL';
      else if (quantity < 50) finalStatus = 'LOW';
    }

    try {
      const payload = {
        name: name.trim(), 
        category, 
        total_quantity: Number(quantity), totalQuantity: Number(quantity),
        available_quantity: Number(quantity), availableQuantity: Number(quantity),
        maintenance_status: finalStatus, maintenanceStatus: finalStatus
      };

      if (editId) {
        await api.put(`/api/inventory/${editId}`, payload);
        setToast('Item updated successfully.');
      } else {
        await api.post('/api/inventory', payload);
        setToast('Item added successfully.');
      }

      setShowModal(false);
      fetchInventory();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await api.delete(`/api/inventory/${id}`);
      setToast('Item deleted.');
      fetchInventory();
    } catch (err) {
      setToast('Failed to delete item: ' + errorMessage(err));
    }
  };

  // Ensure case-insensitive filters since API might return variations
  const normalizeStatus = (s: string) => (s || 'Good').toUpperCase();

  const filtered = items
    .filter(i => filter === 'ALL' || normalizeStatus(i.maintenance_status || i.maintenanceStatus) === filter)
    .filter(i => !search || 
      (i.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (i.category || '').toLowerCase().includes(search.toLowerCase())
    );

  const getStatusBadge = (status: string) => {
    const s = normalizeStatus(status);
    if (s === 'CRITICAL') return 'CRITICAL';
    if (s === 'LOW') return 'LOW';
    return 'GOOD';
  };

  return (
    <AdminLayout title="Inventory">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Inventory"
          subtitle={`${items.length} items tracked`}
          breadcrumb={['Logistics', 'Inventory']}
          action={<PrimaryBtn onClick={openAdd}>+ Add Item</PrimaryBtn>}
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <KPICard label="Total Items" value={items.length} accent="var(--color-ink)" />
          <KPICard label="Low Stock" value={items.filter(i => normalizeStatus(i.maintenance_status || i.maintenanceStatus) === 'LOW').length} accent="var(--color-amber)" />
          <KPICard label="Critical" value={items.filter(i => normalizeStatus(i.maintenance_status || i.maintenanceStatus) === 'CRITICAL').length} accent="var(--color-red)" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={['ALL', 'GOOD', 'LOW', 'CRITICAL']} active={filter} onChange={setFilter} />
          <div className="ml-auto w-56">
            <SearchInput value={search} onChange={setSearch} placeholder="Search inventory..." />
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <TH>Item</TH>
              <TH>Category</TH>
              <TH right>Total Qty</TH>
              <TH right>Available</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="No items found" message="Try adjusting your filters or search." /></td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <TD><span className="text-sm font-medium text-[var(--color-ink)]">{item.name}</span></TD>
                <TD><span className="text-xs text-[var(--color-muted)]">{item.category}</span></TD>
                <TD right><span className="font-mono text-sm">{item.total_quantity || item.totalQuantity || 0}</span></TD>
                <TD right>
                  <span className={`font-mono text-sm font-semibold ${getStatusBadge(item.maintenance_status || item.maintenanceStatus) === 'CRITICAL' ? 'text-[var(--color-red)]' : getStatusBadge(item.maintenance_status || item.maintenanceStatus) === 'LOW' ? 'text-[var(--color-amber)]' : 'text-[var(--color-ink)]'}`}>
                    {item.available_quantity || item.availableQuantity || 0}
                  </span>
                </TD>
                <TD><Badge label={getStatusBadge(item.maintenance_status || item.maintenanceStatus)} /></TD>
                <TD>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-red)]/10 text-[var(--color-red)] rounded hover:bg-[var(--color-red)] hover:text-white transition-colors">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Delete
                    </button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableShell>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Inventory Item" : "Add Inventory Item"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Item Name" required>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Potatoes" required />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required>
                <Select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Spices">Spices</option>
                  <option value="Gas">Gas</option>
                  <option value="Kitchen Equipment">Kitchen Equipment</option>
                  <option value="Cooking Items">Cooking Items</option>
                  <option value="Meat/Poultry">Meat/Poultry</option>
                  <option value="Dairy">Dairy</option>
                </Select>
              </FormField>
              <FormField label="Quantity" required>
                <Input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="100" required />
              </FormField>
            </div>

            <FormField label="Inventory Stage / Status" required>
              <Select value={mStatus} onChange={e => setMStatus(e.target.value)}>
                <option value="GOOD">Good</option>
                <option value="LOW">Low</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </FormField>

            <div className="flex gap-3 pt-2">
              <PrimaryBtn type="submit" className="flex-1">{editId ? "Save Changes" : "Save Item"}</PrimaryBtn>
              <SecondaryBtn type="button" onClick={() => setShowModal(false)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </form>
        </Modal>

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};