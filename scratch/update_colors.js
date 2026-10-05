
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminBilling.tsx", "utf8");

code = code.replace(
  /className=\{`text-xs p-1 border rounded cursor-pointer w-32 \$\{inv\.booking_status === 'COMPLETED' \? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'\}`\}/g,
  "className={`text-xs p-1 border rounded cursor-pointer w-32 font-medium ${inv.booking_status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}"
);

fs.writeFileSync("frontend/src/pages/AdminBilling.tsx", code);

