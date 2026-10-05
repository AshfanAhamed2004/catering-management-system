
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  /<form onSubmit=\{handleEditSubmit\} className="space-y-4">\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Role<\/label>/m,
  `<form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>`
);

// I need to add editName to the PUT payload again just in case it also failed due to CRLF
ui = ui.replace(
  /role: editRole,\s*isActive: editActive, is_active: editActive\s*\}\);/m,
  `role: editRole,
          isActive: editActive, is_active: editActive,
          fullName: editName, full_name: editName
        });`
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

