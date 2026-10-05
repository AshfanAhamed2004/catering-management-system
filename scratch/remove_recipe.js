
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminMenuEngineering.tsx", "utf8");

// We need to remove the "Edit Recipe" button.
const oldButtons = `{canManageIngredients && (
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

const newButtons = `{canManageIngredients && (
                  <div className="flex gap-4">
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

