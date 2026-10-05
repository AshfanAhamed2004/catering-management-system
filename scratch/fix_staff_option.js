
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

code = code.replace(
  /\{s\.fullName \|\| s\.email\}/g,
  "{s.full_name || s.fullName || s.email}"
);

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

