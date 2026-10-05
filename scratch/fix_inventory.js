
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminInventory.tsx", "utf8");

code = code.replace(/useState\('Furniture'\)/, "useState('Vegetables')");
code = code.replace(/placeholder="e\.g\. Gold Chair"/, "placeholder=\"e.g. Tomatoes\"");

const oldOptions = `<option>Furniture</option>
              <option>Tableware</option>
              <option>Equipment</option>`;
const newOptions = `<option>Vegetables</option>
              <option>Spices</option>
              <option>Gas</option>
              <option>Kitchen Equipment</option>
              <option>Cooking Items</option>`;
code = code.replace(oldOptions, newOptions);

const oldPayload = `await api.post('/api/inventory', {
        name, category, totalQuantity: quantity, availableQuantity: quantity, maintenanceStatus: 'Good'
      });`;
const newPayload = `await api.post('/api/inventory', {
        name, category, total_quantity: quantity, available_quantity: quantity, maintenance_status: 'Good'
      });`;
code = code.replace(oldPayload, newPayload);

code = code.replace(/\{item\.totalQuantity\}/g, "{item.total_quantity || item.totalQuantity}");
code = code.replace(/\{item\.availableQuantity\}/g, "{item.available_quantity || item.availableQuantity}");

fs.writeFileSync("frontend/src/pages/AdminInventory.tsx", code);

