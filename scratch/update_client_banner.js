
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

const oldBanner = `            <div>
              <h3 className="font-bold text-blue-800">You have {bookings.filter(b=>b.status==='APPROVED' || b.status==='PENDING').length} upcoming events</h3>
            </div>`;

const newBanner = `            <div>
              <h3 className="font-bold text-blue-800">You have {bookings.filter(b=>b.status==='APPROVED' || b.status==='PENDING').length} upcoming events</h3>
              {bookings.filter(b => b.status === 'COMPLETED' && !feedbackList.some(f => f.booking_id === b.id)).length > 0 && (
                <p className="text-sm font-semibold text-green-700 mt-1">
                  You have {bookings.filter(b => b.status === 'COMPLETED' && !feedbackList.some(f => f.booking_id === b.id)).length} completed event(s) awaiting your feedback!
                </p>
              )}
            </div>`;

code = code.replace(oldBanner, newBanner);

fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", code);

