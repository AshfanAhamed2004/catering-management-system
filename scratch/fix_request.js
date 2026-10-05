
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientBookingRequest.tsx", "utf8");

code = code.replace("import { useState }", "import { useState, useEffect }");
code = code.replace(
  "const [error, setError] = useState('');",
  `const [error, setError] = useState('');\n  const [packages, setPackages] = useState<any[]>([]);\n  useEffect(() => {\n    api.get('/packages').then(res => {\n      setPackages(res.data);\n      if (res.data.length > 0) setPackageId(res.data[0].id);\n    }).catch(console.error);\n  }, []);\n  const selectedPackage = packages.find(p => p.id === packageId);\n  const price = selectedPackage ? Number(selectedPackage.price_per_person) : 0;\n  const total = guests * price;`
);

const selectRegex = /<select value=\{packageId\}[^>]*>[\s\S]*?<\/select>/;
const newSelect = `<select value={packageId} onChange={e=>setPackageId(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded bg-white">
                  {packages.map(p => (
                     <option key={p.id} value={p.id}>{p.name} ($\{p.price_per_person}/hd)</option>
                  ))}
                </select>`;
code = code.replace(selectRegex, newSelect);

code = code.replace(/guests \* 85/g, "total");

fs.writeFileSync("frontend/src/pages/ClientBookingRequest.tsx", code);

