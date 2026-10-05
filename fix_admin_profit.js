const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminProfitability.tsx', 'utf-8');
content = content.replace(/return "\$0\.00";/g, 'return "Rs. 0.00";');
content = content.replace(/return "\\$" \+ Number\(v\)/g, 'return "Rs. " + Number(v)');
content = content.replace(/Amount \(\$\)/g, 'Amount (Rs.)');
fs.writeFileSync('frontend/src/pages/AdminProfitability.tsx', content, 'utf-8');
