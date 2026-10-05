const fs = require('fs');
let text = fs.readFileSync('frontend/src/components/AdminLayout.tsx', 'utf8');
const replacement = '<Link to=\"/admin/packages\" className={\`block px-4 py-2 rounded-md \`}>Packages Catalog</Link>\n              <Link to=\"/admin/forecast\" className={\`block px-4 py-2 rounded-md \`}>Ingredient Forecasting</Link>';
text = text.replace('<Link to=\"/admin/packages\" className={\`block px-4 py-2 rounded-md \`}>Packages Catalog</Link>', replacement);
fs.writeFileSync('frontend/src/components/AdminLayout.tsx', text);
