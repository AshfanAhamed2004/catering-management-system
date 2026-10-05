
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminForecasting.tsx", "utf8");

code = code.replace(
  "setBookings(bookingsRes.data);",
  "setBookings(bookingsRes.data.filter(b => b.status === 'APPROVED'));"
);

fs.writeFileSync("frontend/src/pages/AdminForecasting.tsx", code);

