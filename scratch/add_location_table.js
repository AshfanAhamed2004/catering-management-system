
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

// Add header
code = code.replace(
  /<th className="p-4 font-medium">Booking Ref<\/th>/g,
  "<th className=\"p-4 font-medium\">Booking Ref</th>\n                    <th className=\"p-4 font-medium\">Location</th>"
);

// Add cell. The booking might have event_location attached to the schedule?
// Wait! Does ScheduleOut have eventLocation?

