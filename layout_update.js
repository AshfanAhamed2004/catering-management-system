const fs = require('fs');
let text = fs.readFileSync('frontend/src/components/AdminLayout.tsx', 'utf8');
const searchStr = '{[\'GENERAL_MANAGER\', \'FINANCE_OFFICER\'].includes(user.role) && (\n            <Link to=\"/admin/billing\" className={\lock px-4 py-2 rounded-md \\}>Billing & Invoicing</Link>\n          )}';
const replStr = '{[\'GENERAL_MANAGER\', \'FINANCE_OFFICER\'].includes(user.role) && (\n            <>\n              <Link to=\"/admin/profitability\" className={\lock px-4 py-2 rounded-md \\}>Revenue & Receivables</Link>\n              <Link to=\"/admin/billing\" className={\lock px-4 py-2 rounded-md \\}>Billing & Invoicing</Link>\n            </>\n          )}';
if(text.includes(searchStr)) {
  text = text.replace(searchStr, replStr);
  fs.writeFileSync('frontend/src/components/AdminLayout.tsx', text);
  console.log('Success');
} else {
  console.log('Not found');
}
