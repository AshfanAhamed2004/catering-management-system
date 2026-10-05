
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/App.tsx", "utf8");

ui = ui.replace(
  "{/* Fallback */}",
  "<Route path=\"/no-access\" element={<div className=\"p-10 text-center\"><h1 className=\"text-2xl font-bold\">Access Denied</h1><p>You do not have permission to access the system dashboard.</p><button onClick={() => { sessionStorage.removeItem(\"catering_token\"); window.location.href=\"/login\"; }} className=\"mt-4 text-blue-500 underline\">Logout</button></div>} />\n      {/* Fallback */}"
);

fs.writeFileSync("frontend/src/App.tsx", ui);

