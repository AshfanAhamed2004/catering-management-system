
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/pages/AdminStaff.tsx", "utf8");

// Add handleDelete function
const deleteFn = `
    const handleDelete = async (id: number) => {
      if (!confirm("Are you sure you want to permanently delete this user? All their history (bookings, schedules, waste records) will be wiped.")) return;
      try {
        await api.delete(\`/admin/users/\${id}\`);
        fetchUsers();
      } catch (err) {
        alert(errorMessage(err) || "Failed to delete user");
      }
    };
`;
ui = ui.replace("const handleEditSubmit", deleteFn + "\n  const handleEditSubmit");

// Add the Delete button to the UI
ui = ui.replace(
  "<button onClick={() => { setShowEdit(u); setEditRole(u.role); setEditActive(u.is_active); setError(''); }} className=\"text-blue-600 hover:underline\">Edit</button>",
  "<button onClick={() => { setShowEdit(u); setEditRole(u.role); setEditActive(u.is_active); setError(''); }} className=\"text-blue-600 hover:underline mr-3\">Edit</button>\n                        <button onClick={() => handleDelete(u.id)} className=\"text-red-600 hover:underline\">Delete</button>"
);

fs.writeFileSync("frontend/src/pages/AdminStaff.tsx", ui);

