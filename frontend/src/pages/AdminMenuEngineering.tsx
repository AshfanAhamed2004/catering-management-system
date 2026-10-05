import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import { MenuItem, IngredientRequirementOut } from '../types';
import { useAuth } from '../auth';
import {
  PageHeader, PrimaryBtn, FilterTabs, SearchInput, GhostBtn, Modal,
  FormField, Input, Select, SecondaryBtn, Toast, EmptyState
} from '../figma_templates/components';

export const AdminMenuEngineering = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  
  const [ingredients, setIngredients] = useState<IngredientRequirementOut[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  
  const [toast, setToast] = useState('');
  
  // Forms
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  
  const [ingredientName, setIngredientName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState('kg');

  const canManageIngredients = user && ['HEAD_CHEF', 'GENERAL_MANAGER'].includes(user.role);

  const fetchItems = () => {
    api.get<MenuItem[]>('/staff/menu-items').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateDish = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!dishName) return;
    try {
      await api.post('/staff/menu-items', {
        name: dishName,
        description: dishDescription,
        category: dishCategory,
        dietary_information: '',
        is_active: true
      });
      setShowAdd(false);
      setDishName('');
      setDishDescription('');
      setToast('Dish added successfully.');
      fetchItems();
    } catch(err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDeleteDish = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await api.delete(`/staff/menu-items/${id}`);
      setToast('Dish deleted.');
      setItems(items.filter(i => i.id !== id));
    } catch (err: any) {
      if (err.response?.status === 409) {
        setToast("Cannot delete dish because it is in a package.");
      } else {
        setToast("Failed to delete dish");
      }
    }
  };

  const openRecipeModal = async (item: MenuItem) => {
    setEditItem(item);
    setIngredients([]);
    setIngredientName('');
    setQuantity('');
    setUnit('kg');
    setLoadingIngredients(true);
    try {
      const res = await api.get<IngredientRequirementOut[]>('/staff/menu-items/' + item.id + '/ingredients');
      setIngredients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleAddIngredient = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editItem || !ingredientName.trim() || !quantity || !unit.trim()) return;
    
    try {
      // Keep snake_case for the payload if backend requires it (usually safe for Spring Boot @JsonProperty)
      await api.post('/staff/menu-items/' + editItem.id + '/ingredients', {
        ingredient_name: ingredientName.trim(),
        quantity_per_guest: quantity,
        unit: unit.trim()
      });
      setIngredientName('');
      setQuantity('');
      setUnit('kg');
      
      const res = await api.get<IngredientRequirementOut[]>('/staff/menu-items/' + editItem.id + '/ingredients');
      setIngredients(res.data);
      setToast('Ingredient added.');
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDeleteIngredient = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ingredient requirement?')) return;
    if (!editItem) return;
    
    try {
      await api.delete('/staff/ingredients/' + id);
      const res = await api.get<IngredientRequirementOut[]>('/staff/menu-items/' + editItem.id + '/ingredients');
      setIngredients(res.data);
      setToast('Ingredient removed.');
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category || 'Other')))];
  const filtered = items
    .filter(m => filter === 'All' || m.category === filter)
    .filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Menu Engineering">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Menu Engineering"
          subtitle={`${items.length} items`}
          breadcrumb={['Kitchen', 'Menu Engineering']}
          action={canManageIngredients ? <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add Item</PrimaryBtn> : undefined}
        />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={categories} active={filter} onChange={setFilter} />
          <div className="ml-auto w-56">
            <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-1 md:col-span-2">
              <EmptyState title="No items found" message="Try adjusting your filters or search." />
            </div>
          ) : filtered.map(item => (
            <div key={item.id} className={`bg-[var(--color-surface)] border rounded-xl p-5 hover:shadow-md transition-all ${!item.is_active ? 'opacity-60' : 'border-[var(--color-border)]'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)]">{item.category}</span>
                    {item.dietary_information && item.dietary_information.split(',').map((d: string) => (
                      <span key={d} className="text-[9px] font-mono bg-[var(--color-green-light)] text-[var(--color-green)] px-1.5 py-0.5 rounded font-medium">{d.trim()}</span>
                    ))}
                  </div>
                  <h3 className="font-display font-semibold text-[var(--color-ink)] text-lg leading-tight">{item.name}</h3>
                  {item.description && <p className="text-xs text-[var(--color-muted)] mt-1">{item.description}</p>}
                </div>
                <span className={`text-xs font-mono shrink-0 ${item.is_active ? 'text-[var(--color-green)]' : 'text-[var(--color-muted)]'}`}>
                  {item.is_active ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--color-divider)]">
                {canManageIngredients && (
                  <>
                    <GhostBtn onClick={() => openRecipeModal(item)}>Manage Recipe</GhostBtn>
                    <GhostBtn onClick={() => handleDeleteDish(item.id)} className="text-[10px] font-mono text-[var(--color-red)] hover:underline ml-2">Delete</GhostBtn>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Modal */}
        {showAdd && (
          <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Menu Item">
            <div className="space-y-4">
              <FormField label="Item Name" required><Input value={dishName} onChange={e => setDishName(e.target.value)} placeholder="e.g. Lobster Bisque" /></FormField>
              <FormField label="Category" required>
                <Select value={dishCategory} onChange={e => setDishCategory(e.target.value)}>
                  {['Starter', 'Main Course', 'Dessert', 'Beverage'].map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormField>
              <FormField label="Description">
                <Input value={dishDescription} onChange={e => setDishDescription(e.target.value)} placeholder="Brief description of the dish" />
              </FormField>
              <div className="flex gap-3 pt-2">
                <PrimaryBtn onClick={handleCreateDish} className="flex-1">Add Dish</PrimaryBtn>
                <SecondaryBtn onClick={() => setShowAdd(false)} className="flex-1">Cancel</SecondaryBtn>
              </div>
            </div>
          </Modal>
        )}

        {/* Recipe / Ingredients Modal */}
        {editItem && (
          <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Recipe: ${editItem.name}`}>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-ink)] mb-3">Required Ingredients (per guest)</h4>
                {loadingIngredients ? (
                  <div className="text-sm text-[var(--color-muted)]">Loading...</div>
                ) : ingredients.length === 0 ? (
                  <div className="text-sm text-[var(--color-muted)] italic">No ingredients specified.</div>
                ) : (
                  <ul className="divide-y divide-[var(--color-divider)]">
                    {ingredients.map(ing => (
                      <li key={ing.id} className="py-2 flex items-center justify-between text-sm">
                        <span className="text-[var(--color-ink)]">{ing.ingredientName || ing.ingredient_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[var(--color-muted)]">{ing.quantityPerGuest || ing.quantity_per_guest} {ing.unit}</span>
                          <GhostBtn onClick={() => handleDeleteIngredient(ing.id)} className="text-[var(--color-red)] hover:underline text-xs">Remove</GhostBtn>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)]">
                <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">Add Ingredient</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <FormField label="Name"><Input value={ingredientName} onChange={e => setIngredientName(e.target.value)} placeholder="e.g. Flour" /></FormField>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Qty"><Input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.1" /></FormField>
                    <FormField label="Unit"><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg" /></FormField>
                  </div>
                </div>
                <PrimaryBtn onClick={handleAddIngredient} className="w-full">Add to Recipe</PrimaryBtn>
              </div>
            </div>
          </Modal>
        )}

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
