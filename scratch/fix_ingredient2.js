
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminMenuEngineering.tsx", "utf8");

code = code.replace(/ingredientName: ingredientName\.trim\(\),/g, "ingredient_name: ingredientName.trim(),");
code = code.replace(/quantityPerGuest: quantity,/g, "quantity_per_guest: quantity,");

fs.writeFileSync("frontend/src/pages/AdminMenuEngineering.tsx", code);

