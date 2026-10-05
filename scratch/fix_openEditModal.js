
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminScheduling.tsx", "utf8");

code = code.replace(
  /const openEditModal = \(s: ScheduleOut\) => \{[\s\S]*?setShowModal\(true\);\n    \};/g,
  `const openEditModal = (s: ScheduleOut) => {
      setEditId(s.id);
      setBookingId((s.booking_id || s.bookingId).toString());
      setStaffId((s.staff_id || s.staffId).toString());
      setShiftDate(s.shift_date || s.shiftDate);
      setStartTime(s.start_time || s.startTime);
      setEndTime(s.end_time || s.endTime);
      setNotes(s.notes || "");
      setStatus(s.status);
      setFormError("");
      setShowModal(true);
    };`
);

fs.writeFileSync("frontend/src/pages/AdminScheduling.tsx", code);

