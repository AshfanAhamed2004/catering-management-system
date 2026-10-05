
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminFeedback.tsx", "utf8");

ui = ui.replace(
  "{ status, staff_response: responseText, staffResponse: responseText, categories: [] }",
  "{ status, staff_response: responseText, staffResponse: responseText }"
);

fs.writeFileSync("frontend/src/pages/AdminFeedback.tsx", ui);

