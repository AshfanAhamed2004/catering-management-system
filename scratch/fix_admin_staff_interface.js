
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  "isActive: boolean;",
  "is_active: boolean;"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

