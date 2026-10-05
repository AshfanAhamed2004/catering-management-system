
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

// We need to fix the POST and PUT payloads in handleSave
code = code.replace(/bookingId: Number\(bookingId\),/g, "booking_id: Number(bookingId),");
code = code.replace(/staffId: Number\(staffId\),/g, "staff_id: Number(staffId),");
code = code.replace(/shiftDate,/g, "shift_date: shiftDate,");
code = code.replace(/startTime,/g, "start_time: startTime,");
code = code.replace(/endTime,/g, "end_time: endTime,");

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

