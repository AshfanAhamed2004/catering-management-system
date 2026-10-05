
const fs = require("fs");
let ui = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", "utf8");

ui = ui.replace(
  "this.em=em;\n @DeleteMapping",
  "this.em=em;}\n @DeleteMapping"
);

fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", ui);

