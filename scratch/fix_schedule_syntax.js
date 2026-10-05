
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

// Fix useState
code = code.replace(/const \[shift_date: shiftDate, setShiftDate\]/g, "const [shiftDate, setShiftDate]");
code = code.replace(/const \[start_time: startTime, setStartTime\]/g, "const [startTime, setStartTime]");
code = code.replace(/const \[end_time: endTime, setEndTime\]/g, "const [endTime, setEndTime]");

// Fix status update handler
code = code.replace(/shiftDate: schedule\.shift_date: shiftDate,/g, "shift_date: schedule.shiftDate,");
code = code.replace(/startTime: schedule\.start_time: startTime,/g, "start_time: schedule.startTime,");
code = code.replace(/endTime: schedule\.end_time: endTime,/g, "end_time: schedule.endTime,");

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

