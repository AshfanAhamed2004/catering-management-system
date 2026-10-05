import re

with open('frontend/src/pages/AdminMenuEngineering.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add states for Add Dish modal
state_injection = '''  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName) return;
    try {
      await api.post('/staff/menu-items', {
        name: dishName,
        description: dishDescription,
        category: dishCategory,
        dietaryInformation: '',
        active: true
      });
      setIsDishModalOpen(false);
      setDishName('');
      setDishDescription('');
      // refresh
      const res = await api.get('/staff/menu-items');
      setItems(res.data);
    } catch(err) {
      console.error(err);
      alert('Failed to create dish');
    }
  };

'''
code = code.replace("  const canManageIngredients = user && ['HEAD_CHEF', 'GENERAL_MANAGER'].includes(user.role);", state_injection + "  const canManageIngredients = user && ['HEAD_CHEF', 'GENERAL_MANAGER'].includes(user.role);")

# Update Add Dish button
old_btn = '''<button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add Dish</button>'''
new_btn = '''<button onClick={() => setIsDishModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Add Dish</button>'''
code = code.replace(old_btn, new_btn)

# Add Add Dish modal
modal_jsx = '''
      {isDishModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Add New Dish</h3>
              <button onClick={() => setIsDishModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold">&times;</button>
            </div>
            <form onSubmit={handleCreateDish} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input required type="text" value={dishName} onChange={e=>setDishName(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. Lobster Bisque" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input required type="text" value={dishCategory} onChange={e=>setDishCategory(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g. Main Course" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required value={dishDescription} onChange={e=>setDishDescription(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" rows={3} placeholder="A short description..."></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">Save Dish</button>
            </form>
          </div>
        </div>
      )}
'''
code = code.replace("    </AdminLayout>", modal_jsx + "    </AdminLayout>")

with open('frontend/src/pages/AdminMenuEngineering.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
