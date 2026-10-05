
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/auth.tsx", "utf8");

ui = ui.replace(
  "default: return '/login';",
  "default: return '/no-access';"
);

fs.writeFileSync("frontend/src/auth.tsx", ui);

