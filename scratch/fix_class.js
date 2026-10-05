
const fs = require("fs");
let ui = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", "utf8");

// Remove the premature closing brace
ui = ui.replace("\n}\n @GetMapping", "\n @GetMapping");

fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", ui);

