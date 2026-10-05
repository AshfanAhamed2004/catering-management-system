
const fs = require("fs");
let code = fs.readFileSync("backend/src/main/java/com/joy/catering/service/BookingService.java", "utf8");

// We need to add `|| (b.getStatus() == BookingStatus.COMPLETED && s == BookingStatus.APPROVED)`
code = code.replace(
  /\|\|\(b\.getStatus\(\)==BookingStatus\.APPROVED&&s==BookingStatus\.COMPLETED\)\)/,
  "||(b.getStatus()==BookingStatus.APPROVED&&s==BookingStatus.COMPLETED)||(b.getStatus()==BookingStatus.COMPLETED&&s==BookingStatus.APPROVED))"
);

fs.writeFileSync("backend/src/main/java/com/joy/catering/service/BookingService.java", code);

