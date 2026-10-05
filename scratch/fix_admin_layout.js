
const fs = require("fs");
let code = fs.readFileSync("frontend/src/components/AdminLayout.tsx", "utf8");

code = code.replace(
  `<span className="text-xs text-gray-500 uppercase font-semibold">Catering Admin</span>`,
  `<span className="text-xs text-gray-500 uppercase font-semibold">{user?.role?.replace(/_/g, " ")}</span>`
);

fs.writeFileSync("frontend/src/components/AdminLayout.tsx", code);

