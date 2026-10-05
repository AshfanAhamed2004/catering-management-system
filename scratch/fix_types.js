
const fs = require("fs");
let ui = fs.readFileSync("frontend/src/types.ts", "utf8");

ui = ui.replace(
  "export interface FeedbackReportOut {\n  total_feedback: number;\n  average_rating: number;\n  low_rating_count: number;\n  rating_distribution: Record<number, number>;\n  category_breakdown: Record<string, number>;\n  submitted_feedback_count: number;\n  email: string;\n  role: Role;",
  "export interface FeedbackReportOut {\n  total_feedback: number;\n  average_rating: number;\n  low_rating_count: number;\n  rating_distribution: Record<number, number>;\n  category_breakdown: Record<string, number>;\n  submitted_feedback_count: number;\n  unresolved_feedback_count: number;\n  monthly_average_rating: Record<string, number>;\n  monthly_feedback_count: Record<string, number>;\n}\n\nexport type Role = 'GENERAL_MANAGER' | 'HEAD_CHEF' | 'CUSTOMER_SERVICE_SUPERVISOR' | 'EVENT_COORDINATION_OFFICER' | 'FINANCE_OFFICER' | 'CUSTOMER' | 'WAITER' | 'CLEANER' | 'CHEF';\n\nexport interface User {\n  id: number;\n  email: string;\n  role: Role;"
);
fs.writeFileSync("frontend/src/types.ts", ui);

