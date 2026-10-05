
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminMenuEngineering.tsx", "utf8");

code = code.replace(
  "ingredientName: ingredientName.trim(),\n          quantityPerGuest: quantity,",
  "ingredient_name: ingredientName.trim(),\n          quantity_per_guest: quantity,"
);

fs.writeFileSync("frontend/src/pages/AdminMenuEngineering.tsx", code);

