
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

ui = ui.replace(
  "<button onClick={() => { setShowEdit(u); setEditRole(u.role); setEditActive(u.is_active); setError(''); }} className=\"text-blue-600 hover:underline mr-3\">Edit</button>\n                        <button onClick={() => handleDelete(u.id)} className=\"text-red-600 hover:underline\">Delete</button>",
  "<> <button onClick={() => { setShowEdit(u); setEditRole(u.role); setEditActive(u.is_active); setError(''); }} className=\"text-blue-600 hover:underline mr-3\">Edit</button>\n                        <button onClick={() => handleDelete(u.id)} className=\"text-red-600 hover:underline\">Delete</button> </> "
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

