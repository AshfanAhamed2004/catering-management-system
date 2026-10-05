
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminProfitability.tsx", "utf8");

// Fix formatCurrency to handle undefined/null safely just in case
code = code.replace(
  /const formatCurrency = \(val: number\) => \{\r?\n\s*return '\$' \+ val\.toLocaleString\('en-US', \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\);\r?\n\s*\};/,
  `const formatCurrency = (val: number | undefined) => {
    if (val === undefined || val === null) return "$0.00";
    return "$" + Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };`
);

// Map the variables to fallback to snake_case!
code = code.replace(/metrics\.totalPaidRevenue/g, "(metrics.total_paid_revenue || metrics.totalPaidRevenue || 0)");
code = code.replace(/metrics\.pendingReceivables/g, "(metrics.pending_receivables || metrics.pendingReceivables || 0)");
code = code.replace(/metrics\.pipelineBookingValue/g, "(metrics.pipeline_booking_value || metrics.pipelineBookingValue || 0)");
code = code.replace(/metrics\.averageBookingValue/g, "(metrics.average_booking_value || metrics.averageBookingValue || 0)");
code = code.replace(/metrics\.paidInvoiceCount/g, "(metrics.paid_invoice_count || metrics.paidInvoiceCount || 0)");
code = code.replace(/metrics\.pendingInvoiceCount/g, "(metrics.pending_invoice_count || metrics.pendingInvoiceCount || 0)");

fs.writeFileSync("frontend/src/pages/AdminProfitability.tsx", code);

