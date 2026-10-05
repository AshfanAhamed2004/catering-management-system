
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

// Change the booking dropdown text
code = code.replace(
  /\{b\.reference\} - \( {b\.guestCount} guests\)/g,
  "{b.reference} - {b.eventLocation || 'No Location'} ({b.guestCount} guests)"
);

// We should also replace it if the existing code has slightly different spacing
code = code.replace(
  /\{b\.reference\} - \( \{b\.guestCount\} guests\)/g,
  "{b.reference} - {b.eventLocation || 'No Location'} ({b.guestCount} guests)"
);

code = code.replace(
  /<option key=\{b\.id\} value=\{b\.id\}>\{b\.reference\} - \( \{b\.guest_count\} guests\)<\/option>/g,
  "<option key={b.id} value={b.id}>{b.reference} - {b.event_location || b.eventLocation || 'No Location'} ({b.guest_count || b.guestCount} guests)</option>"
);


fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

