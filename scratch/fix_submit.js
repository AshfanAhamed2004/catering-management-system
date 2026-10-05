
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

code = code.replace(
  /categories: \[\]/g,
  "categories"
);

fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", code);

