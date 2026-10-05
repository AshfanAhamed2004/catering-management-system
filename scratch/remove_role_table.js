
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

code = code.replace(/<div className="text-gray-500 text-xs font-mono">\{s\.staff_role \|\| s\.staffRole\}<\/div>/g, "");

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

