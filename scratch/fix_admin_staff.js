
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  /<option value="EVENT_COORDINATION_OFFICER">Event Coordination Officer<\/option>/g,
  "<option value=\"EVENT_COORDINATION_OFFICER\">Event Coordination Officer</option>\n                    <option value=\"CHEF\">Chef</option>\n                    <option value=\"WAITER\">Waiter</option>\n                    <option value=\"CLEANER\">Cleaner</option>"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

