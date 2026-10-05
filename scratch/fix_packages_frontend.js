
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminPackages.tsx", "utf8");

// We need to add an alert for Create Package
const oldCreate = `<button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Create Package</button>`;
const newCreate = `<button onClick={() => alert("Create Package modal logic to be implemented later")} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">Create Package</button>`;
code = code.replace(oldCreate, newCreate);

// Delete function logic
const deleteLogic = `
  const handleDeletePackage = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await api.delete(\`/staff/packages/\${id}\`);
      setPackages(packages.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete package: " + (err.response?.data?.message || ""));
    }
  };
`;

code = code.replace("  useEffect(() => {", deleteLogic + "\n  useEffect(() => {");

// Edit/Archive buttons
const oldArchive = `<button className="bg-gray-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-50">Archive</button>`;
const newArchive = `<button onClick={() => handleDeletePackage(pkg.id)} className="bg-gray-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-50">Delete</button>`;
code = code.replace(oldArchive, newArchive);

fs.writeFileSync("frontend/src/pages/AdminPackages.tsx", code);

