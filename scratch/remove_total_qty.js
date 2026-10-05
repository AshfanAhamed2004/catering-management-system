
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminInventory.tsx", "utf8");

code = code.replace(/<th className="p-4 font-medium">Total Quantity<\/th>\r?\n\s*/, "");
code = code.replace(/<td className="p-4 text-gray-600">\{item\.total_quantity \|\| item\.totalQuantity\}<\/td>\r?\n\s*/g, "");
code = code.replace(/colSpan=\{5\}/g, "colSpan={4}");

fs.writeFileSync("frontend/src/pages/AdminInventory.tsx", code);

