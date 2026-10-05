
const fs = require("fs");

const code = `import { useState, useEffect } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { api } from "../api";

export const AdminPackages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventTypeId, setEventTypeId] = useState<number | "">("");
  const [pricePerPerson, setPricePerPerson] = useState<number | "">("");
  const [minimumGuestCount, setMinimumGuestCount] = useState<number | "">("");
  const [maximumGuestCount, setMaximumGuestCount] = useState<number | "">("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);

  const fetchPackages = () => api.get("/staff/packages").then(res => setPackages(res.data)).catch(console.error);

  useEffect(() => {
    fetchPackages();
    api.get("/event-types").then(res => setEventTypes(res.data)).catch(console.error);
    api.get("/staff/menu-items").then(res => setMenuItems(res.data)).catch(console.error);
  }, []);

  const handleDeletePackage = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await api.delete(\`/staff/packages/\${id}\`);
      setPackages(packages.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete package: " + (err.response?.data?.message || ""));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setEventTypeId(eventTypes[0]?.id || "");
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
        alert("Please select at least one menu item.");
        return;
    }
    const payload = {
      name,
      description,
      eventTypeId: Number(eventTypeId),
      pricePerPerson: Number(pricePerPerson),
      minimumGuestCount: Number(minimumGuestCount),
      maximumGuestCount: maximumGuestCount ? Number(maximumGuestCount) : null,
      menuItemIds: selectedMenuItems,
      isActive
    };

    try {
      if (editingId) {
        await api.put(\`/staff/packages/\${editingId}\`, payload);
      } else {
        await api.post("/staff/packages", payload);
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      alert("Failed to save package: " + JSON.stringify(err.response?.data || err.message));
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
    <AdminLayout title="Catering Packages">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Combine menu items into ready-to-sell packages.</p>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Create Package</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600&auto=format&fit=crop')" }}></div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{pkg.name}</h3>
                <span className="font-bold text-blue-700 whitespace-nowrap ml-2">\${pkg.price_per_person || pkg.pricePerPerson} / guest</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-1">{pkg.description}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEditModal(pkg)} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 flex-1">Edit</button>
                <button onClick={() => handleDeletePackage(pkg.id)} className="bg-gray-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p className="text-gray-500">No packages found.</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{editingId ? "Edit Package" : "Create New Package"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500" rows={3}></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select required value={eventTypeId} onChange={e => setEventTypeId(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500">
                    <option value="">Select Event Type</option>
                    {eventTypes.map((et: any) => (
                      <option key={et.id} value={et.id}>{et.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Guest ($)</label>
                  <input type="number" step="0.01" required min="1" value={pricePerPerson} onChange={e => setPricePerPerson(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Guests</label>
                  <input type="number" required min="1" value={minimumGuestCount} onChange={e => setMinimumGuestCount(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Guests (Optional)</label>
                  <input type="number" min="1" value={maximumGuestCount} onChange={e => setMaximumGuestCount(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Menu Items</label>
                <div className="grid grid-cols-2 gap-2 border border-gray-200 p-3 rounded max-h-60 overflow-y-auto">
                  {menuItems.map((item: any) => (
                    <label key={item.id} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedMenuItems.includes(item.id)}
                        onChange={() => toggleMenuItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                  {menuItems.length === 0 && <p className="text-gray-500 text-sm">No menu items available.</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
`;

fs.writeFileSync("frontend/src/pages/AdminPackages.tsx", code);

