
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

code = code.replace(
  /<option key=\{b\.id\} value=\{b\.id\}>\{b\.reference\}.*?<\/option>/g,
  "<option key={b.id} value={b.id}>{b.reference} - {b.event_location || b.eventLocation || 'No Location'} - ({b.guest_count || b.guestCount || 0} guests)</option>"
);

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

