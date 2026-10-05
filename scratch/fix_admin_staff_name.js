
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

// Change fullName to full_name in interface
ui = ui.replace(
  "fullName: string;",
  "full_name: string;"
);

// Fix the display in the table
ui = ui.replace(
  "{u.fullName || 'No Name'}",
  "{u.full_name || 'No Name'}"
);
ui = ui.replace(
  "{showEdit.fullName || showEdit.email}",
  "{showEdit.full_name || showEdit.email}"
);

// Add edit name state
ui = ui.replace(
  "const [editActive, setEditActive] = useState(true);",
  "const [editActive, setEditActive] = useState(true);\n    const [editName, setEditName] = useState('');"
);

// Set edit name when opening modal
ui = ui.replace(
  "setEditActive(u.is_active); setError('');",
  "setEditActive(u.is_active); setEditName(u.full_name || ''); setError('');"
);

// Add editName to the PUT payload
ui = ui.replace(
  "role: editRole,\n          isActive: editActive, is_active: editActive",
  "role: editRole,\n          isActive: editActive, is_active: editActive,\n          fullName: editName, full_name: editName"
);

// Add Name input to Edit Modal
const nameInput = `
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
`;
ui = ui.replace(
  "<form onSubmit={handleEditSubmit} className=\"space-y-4\">\n                <div>\n                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Role</label>",
  "<form onSubmit={handleEditSubmit} className=\"space-y-4\">" + nameInput + "\n                <div>\n                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Role</label>"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

