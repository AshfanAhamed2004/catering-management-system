
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminMenuEngineering.tsx", "utf8");

code = code.replace("api.get<MenuItem[]>(\"/api/catalog/menu\")", "api.get<MenuItem[]>(\"/staff/menu-items\")");

fs.writeFileSync("frontend/src/pages/AdminMenuEngineering.tsx", code);

