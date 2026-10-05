
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminBookings.tsx", "utf8");

code = code.replace(
  /const approved = bookings\.filter\(b => b\.status === 'APPROVED'\);/,
  "const approved = bookings.filter(b => b.status === 'APPROVED' || b.status === 'COMPLETED');"
);

code = code.replace(
  /<h3 className="text-lg font-semibold text-gray-800 mb-4">Approved & Upcoming<\/h3>/,
  `<h3 className="text-lg font-semibold text-gray-800 mb-4">Approved & Completed</h3>`
);

code = code.replace(
  /<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Approved<\/span>/,
  `<span className={\`text-xs px-2 py-1 rounded \${b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}\`}>{b.status === 'COMPLETED' ? 'Completed' : 'Approved'}</span>`
);

fs.writeFileSync("frontend/src/pages/AdminBookings.tsx", code);

