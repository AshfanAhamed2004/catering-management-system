
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminInventory.tsx", "utf8");

code = code.replace(/<h3 className="font-semibold text-gray-700">Equipment Stock<\/h3>/, `<h3 className="font-semibold text-gray-700">Kitchen Inventory</h3>`);

fs.writeFileSync("frontend/src/pages/AdminInventory.tsx", code);

