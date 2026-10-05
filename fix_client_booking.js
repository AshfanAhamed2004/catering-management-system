const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/ClientBookingRequest.tsx', 'utf-8');
content = content.replace(/\$([^\{])/g, 'Rs. $1'); // Any $ not followed by {
content = content.replace(/\$\{p\.price_per_person\}/g, 'Rs. ${p.price_per_person}');
content = content.replace(/— \$Rs\./g, '— Rs.'); // Fix double
fs.writeFileSync('frontend/src/pages/ClientBookingRequest.tsx', content, 'utf-8');
