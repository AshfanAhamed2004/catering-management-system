
const fs = require("fs");
let ui = fs.readFileSync("backend/src/main/java/com/joy/catering/dto/Dtos.java", "utf8");

ui = ui.replace(
  "public record UserUpdate(Role role,boolean isActive){}",
  "public record UserUpdate(Role role,boolean isActive, String fullName){}"
);

fs.writeFileSync("backend/src/main/java/com/joy/catering/dto/Dtos.java", ui);

