
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  "fullName: addName,",
  "fullName: addName, full_name: addName,"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

