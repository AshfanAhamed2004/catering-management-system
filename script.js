const fs = require('fs');
let text = fs.readFileSync('frontend/src/components/AdminLayout.tsx', 'utf8');
text = text.replace(/<Link to=\"\/admin\/forecast\".*?<\/Link>/g, '');
text = text.replace('<Link to=\"/admin/packages\" className={\`block px-4 py-2 rounded-md \`}>Packages Catalog</Link>', '<Link to=\"/admin/packages\" className={\`block px-4 py-2 rounded-md \`}>Packages Catalog</Link>\n              <Link to=\"/admin/forecast\" className={\`block px-4 py-2 rounded-md \`}>Ingredient Forecasting</Link>');
fs.writeFileSync('frontend/src/components/AdminLayout.tsx', text);
