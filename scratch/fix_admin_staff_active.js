
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  /u\.isActive/g,
  "u.is_active"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

