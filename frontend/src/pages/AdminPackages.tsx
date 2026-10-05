import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { api, errorMessage } from "../api";
import {
  PageHeader, PrimaryBtn, SecondaryBtn, DangerBtn, Modal,
  FormField, Input, Select, Textarea, Badge, Toast, EmptyState
} from "../figma_templates/components";

export const AdminPackages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventTypeId, setEventTypeId] = useState<number | string>("");
  const [pricePerPerson, setPricePerPerson] = useState<number | string>("");
  const [minimumGuestCount, setMinimumGuestCount] = useState<number | string>("");
  const [maximumGuestCount, setMaximumGuestCount] = useState<number | string>("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  
  const [toast, setToast] = useState('');

  const fetchPackages = () => api.get("/staff/packages").then(res => setPackages(res.data)).catch(console.error);

  useEffect(() => {
    fetchPackages();
    api.get("/event-types").then(res => setEventTypes(res.data)).catch(console.error);
    api.get("/staff/menu-items").then(res => setMenuItems(res.data)).catch(console.error);
  }, []);

  const handleDeletePackage = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await api.delete(`/staff/packages/${id}`);
      setToast('Package deleted.');
      setPackages(packages.filter(p => p.id !== id));
    } catch (err: any) {
      setToast("Failed to delete package: " + errorMessage(err));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setEventTypeId(eventTypes.length > 0 ? eventTypes[0].id : "");
    setPricePerPerson("");
    setMinimumGuestCount("");
    setMaximumGuestCount("");
    setSelectedMenuItems([]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setEditingId(pkg.id);
    setName(pkg.name);
    setDescription(pkg.description);
    setEventTypeId(pkg.event_type?.id || pkg.eventType?.id || "");
    setPricePerPerson(pkg.price_per_person || pkg.pricePerPerson || "");
    setMinimumGuestCount(pkg.minimum_guest_count || pkg.minimumGuestCount || "");
    setMaximumGuestCount(pkg.maximum_guest_count || pkg.maximumGuestCount || "");
    setSelectedMenuItems((pkg.menu_items || pkg.menuItems || []).map((m: any) => m.id));
    setIsActive(pkg.is_active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    if(selectedMenuItems.length === 0) {
        setToast("Error: Please select at least one menu item.");
        return;
    }
    const payload = {
      name,
      description,
      event_type_id: Number(eventTypeId),
      price_per_person: Number(pricePerPerson),
      minimum_guest_count: Number(minimumGuestCount),
      maximum_guest_count: maximumGuestCount ? Number(maximumGuestCount) : null,
      menu_item_ids: selectedMenuItems,
      is_active: isActive
    };

    try {
      if (editingId) {
        await api.put(`/staff/packages/${editingId}`, payload);
        setToast('Package updated successfully.');
      } else {
        await api.post("/staff/packages", payload);
        setToast('Package created successfully.');
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      setToast("Failed to save package: " + errorMessage(err));
    }
  };

  const toggleMenuItem = (id: number) => {
    if (selectedMenuItems.includes(id)) {
      setSelectedMenuItems(selectedMenuItems.filter(m => m !== id));
    } else {
      setSelectedMenuItems([...selectedMenuItems, id]);
    }
  };

  return (
    <AdminLayout title="Package Builder">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Package Builder"
          subtitle={`${packages.filter(p => p.is_active !== false).length} active packages`}
          breadcrumb={['Kitchen', 'Packages']}
          action={<PrimaryBtn onClick={openCreateModal}>+ New Package</PrimaryBtn>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {packages.length === 0 ? (
            <div className="col-span-1 md:col-span-2">
              <EmptyState title="No packages found" message="Create a package to get started." />
            </div>
          ) : packages.map(pkg => (
            <div key={pkg.id} className={`bg-[var(--color-surface)] border rounded-xl overflow-hidden hover:shadow-lg transition-all ${pkg.is_active !== false ? 'border-[var(--color-border)]' : 'border-[var(--color-border)] opacity-60'}`}>
              <div className="px-5 py-4 border-b border-[var(--color-divider)] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)]">{pkg.event_type?.name || pkg.eventType?.name || 'Event'}</span>
                    <Badge label={pkg.is_active !== false ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-[var(--color-ink)]">{pkg.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-semibold text-[var(--color-ink)]">Rs. {pkg.price_per_person || pkg.pricePerPerson}</div>
                  <div className="text-[10px] font-mono text-[var(--color-muted)]">per person</div>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{pkg.description}</p>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2">Includes • {(pkg.menu_items || pkg.menuItems || []).length} items</div>
                <div className="grid grid-cols-2 gap-1 mb-4">
                  {(pkg.menu_items || pkg.menuItems || []).slice(0, 6).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] truncate">
                      <span className="text-[var(--color-gold)] text-[10px]">✓</span>
                      {item.name}
                    </div>
                  ))}
                  {(pkg.menu_items || pkg.menuItems || []).length > 6 && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      <span className="text-[var(--color-gold)] text-[10px]">+</span>
                      {((pkg.menu_items || pkg.menuItems || []).length - 6)} more
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-3">
                  <span>Min: {pkg.minimum_guest_count || pkg.minimumGuestCount || 0} guests</span>
                  <span>Max: {pkg.maximum_guest_count || pkg.maximumGuestCount || 'No limit'} guests</span>
                </div>
                <div className="flex gap-2">
                  <SecondaryBtn onClick={() => openEditModal(pkg)} className="flex-1 text-xs">Edit Package</SecondaryBtn>
                  <DangerBtn onClick={() => handleDeletePackage(pkg.id)} className="px-3 text-xs">Delete</DangerBtn>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Package" : "Create Package"}>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Package Name" required><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Harvest Table" required /></FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Event Type" required>
                  <Select value={eventTypeId} onChange={e => setEventTypeId(e.target.value)} required>
                    <option value="">Select an event type</option>
                    {eventTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Price Per Person" required>
                  <Input type="number" min="0" step="0.01" value={pricePerPerson} onChange={e => setPricePerPerson(e.target.value)} placeholder="95" required />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Min Guests"><Input type="number" min="1" value={minimumGuestCount} onChange={e => setMinimumGuestCount(e.target.value)} placeholder="20" required /></FormField>
                <FormField label="Max Guests (Optional)"><Input type="number" min="1" value={maximumGuestCount} onChange={e => setMaximumGuestCount(e.target.value)} placeholder="200" /></FormField>
              </div>
              <FormField label="Description"><Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description of this package" /></FormField>
              <FormField label="Menu Items (Select at least one)">
                <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-divider)] max-h-40 overflow-y-auto">
                  {menuItems.map(item => (
                    <label key={item.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--color-bg)] transition-colors">
                      <input type="checkbox" checked={selectedMenuItems.includes(item.id)} onChange={() => toggleMenuItem(item.id)} className="rounded border-[var(--color-border)] text-[var(--color-green)] focus:ring-[var(--color-green)]" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[var(--color-ink)] block truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-[var(--color-muted)]">{item.category}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </FormField>
              <FormField label="Status">
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="active" checked={isActive === v} onChange={() => setIsActive(v)} className="border-[var(--color-border)] text-[var(--color-green)] focus:ring-[var(--color-green)]" />
                      <span className="text-sm text-[var(--color-muted)]">{v ? 'Active' : 'Inactive'}</span>
                    </label>
                  ))}
                </div>
              </FormField>
              <div className="flex gap-3 pt-2">
                <PrimaryBtn type="submit" className="flex-1">{editingId ? "Save Changes" : "Create Package"}</PrimaryBtn>
                <SecondaryBtn type="button" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</SecondaryBtn>
              </div>
            </form>
          </Modal>
        )}

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
