
const fs = require("fs");
let code = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/CatalogController.java", "utf8");
code = code.replace(/SENIOR_CHEF/g, "HEAD_CHEF");
code = code.replace(/ADMIN/g, "GENERAL_MANAGER");
fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/CatalogController.java", code);

