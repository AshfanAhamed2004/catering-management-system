
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  "className=\"text-blue-600 hover:underline mr-3\">Edit</button>",
  "className=\"px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors font-medium text-xs mr-2\">Edit</button>"
);

ui = ui.replace(
  "className=\"text-red-600 hover:underline\">Delete</button>",
  "className=\"px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors font-medium text-xs\">Delete</button>"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

