
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminForecasting.tsx", "utf8");

// We want to replace the garbled text with a simple hyphen.
// Since the string might have weird bytes, I will use a regex.
code = code.replace(/\{b\.reference\}.*?\{b\.package_name \|\| 'Event'\}.*?\{b\.guest_count\}/g, "{b.reference} - {b.package_name || 'Event'} - {b.guest_count}");

fs.writeFileSync("frontend/src/pages/AdminForecasting.tsx", code);

