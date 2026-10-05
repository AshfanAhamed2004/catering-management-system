
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminMenuEngineering.tsx", "utf8");

const deleteHandler = `
  const handleDeleteDish = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await api.delete(\`/staff/menu-items/\${id}\`);
      setItems(items.filter(i => i.id !== id));
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || "Cannot delete dish because it is in a package.");
      } else {
        alert("Failed to delete dish");
      }
    }
  };
`;

code = code.replace("  const openRecipeModal = async (item: MenuItem) => {", deleteHandler + "\n  const openRecipeModal = async (item: MenuItem) => {");

const oldButtons = `{canManageIngredients && (
                  <button 
                    onClick={() => openRecipeModal(item)}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Edit Recipe
                  </button>
                )}`;

const newButtons = `{canManageIngredients && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => openRecipeModal(item)}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Edit Recipe
                    </button>
                    <button 
                      onClick={() => handleDeleteDish(item.id)}
                      className="text-red-600 text-sm font-medium hover:underline"
                    >
                      Delete Dish
                    </button>
                  </div>
                )}`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync("frontend/src/pages/AdminMenuEngineering.tsx", code);

