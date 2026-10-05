
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminCustomer360.tsx", "utf8");

const toggleFunc = `  const toggleActive = async () => {
    try {
      const res = await api.post(\`/staff/customers/\${id}/toggle-active\`);
      setData(res.data);
    } catch(err) {
      console.error(err);
      alert("Failed to toggle status");
    }
  };`;

// Insert the toggle func before return (
code = code.replace("  if (loading) return", toggleFunc + "\n\n  if (loading) return");

const oldStatus = `                <div>
                  {data.profile.active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </div>`;

const newStatus = `                <div>
                  {data.profile.active ? (
                    <button onClick={toggleActive} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition">
                      Active
                    </button>
                  ) : (
                    <button onClick={toggleActive} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition">
                      Inactive
                    </button>
                  )}
                </div>`;

code = code.replace(oldStatus, newStatus);

fs.writeFileSync("frontend/src/pages/AdminCustomer360.tsx", code);

