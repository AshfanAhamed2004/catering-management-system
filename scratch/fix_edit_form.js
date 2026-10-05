
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

const oldStr = "<form onSubmit={handleEditSubmit} className=\"space-y-4\">\n                <div>\n                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Role</label>";

const newStr = `<form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>`;

ui = ui.replace(oldStr, newStr);

// Also I forgot to add editName to the PUT payload in handleEditSubmit
const oldPut = `await api.put(\`/admin/users/\${showEdit.id}\`, {
          role: editRole,
          isActive: editActive, is_active: editActive
        });`;

const newPut = `await api.put(\`/admin/users/\${showEdit.id}\`, {
          role: editRole,
          isActive: editActive, is_active: editActive,
          fullName: editName, full_name: editName
        });`;

ui = ui.replace(oldPut, newPut);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

