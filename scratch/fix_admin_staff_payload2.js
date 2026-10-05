
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  "isActive: editActive",
  "isActive: editActive, is_active: editActive"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

