
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

code = code.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');\n  const [packages, setPackages] = useState<any[]>([]);");

code = code.replace("api.get('/feedback')", "api.get('/feedback'),\n        api.get('/packages')");
code = code.replace("setFeedbackList(fRes.data);", "setFeedbackList(fRes.data);\n      setPackages(pRes.data);");
code = code.replace("const [bRes, fRes] = await Promise.all([", "const [bRes, fRes, pRes] = await Promise.all([");

const selectRegex = /<select value=\{editPackageId\}[^>]*>[\s\S]*?<\/select>/;
const newSelect = `<select value={editPackageId} onChange={e=>setEditPackageId(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded bg-white">
                      {packages.map(p => (
                         <option key={p.id} value={p.id}>{p.name} ($\{p.price_per_person}/hd)</option>
                      ))}
                    </select>`;
code = code.replace(selectRegex, newSelect);

fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", code);

