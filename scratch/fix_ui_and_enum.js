
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

// Fix Enum mapping
code = code.replace(
  /\[\'FOOD_QUALITY\', \'SERVICE\', \'PUNCTUALITY\', \'VALUE\', \'OVERALL\'\]/g,
  "['FOOD_QUALITY', 'SERVICE', 'PUNCTUALITY', 'VALUE_FOR_MONEY', 'VENUE']"
);

code = code.replace(
  /VALUE: 'Value & Pricing',\s*OVERALL: 'Overall Coordination'/,
  "VALUE_FOR_MONEY: 'Value & Pricing',\n                        VENUE: 'Overall Coordination'"
);

// Make UI smaller
code = code.replace(/max-w-lg/g, "max-w-md");
code = code.replace(/<div className="bg-blue-50 border-b border-blue-100 p-6 flex justify-between items-start">/g, '<div className="bg-blue-50 border-b border-blue-100 p-4 flex justify-between items-start">');
code = code.replace(/<div className="p-6">/g, '<div className="p-4">');
code = code.replace(/text-xl font-bold/g, "text-lg font-bold");
code = code.replace(/w-10 h-10/g, "w-8 h-8"); // Make stars smaller
code = code.replace(/mb-8/g, "mb-4");
code = code.replace(/mb-6/g, "mb-3");

fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", code);

