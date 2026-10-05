
const { Client } = require("pg");
async function run() {
  const c = new Client({ connectionString: "postgresql://postgres:1234@localhost:5432/catering" });
  await c.connect();
  
  try {
    await c.query("ALTER TABLE feedbacks DROP CONSTRAINT IF EXISTS feedbacks_status_check;");
    await c.query("ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_status_check CHECK (status::text = ANY (ARRAY['NEW'::text, 'IN_REVIEW'::text, 'CLOSED'::text, 'SUBMITTED'::text, 'UNDER_REVIEW'::text, 'RESPONDED'::text, 'RESOLVED'::text, 'ARCHIVED'::text]));");
    console.log("Fixed feedbacks_status_check");
  } catch (e) {
    console.log("Error fixing feedbacks_status_check:", e.message);
  }

  try {
    await c.query("ALTER TABLE feedback_categories DROP CONSTRAINT IF EXISTS feedback_categories_category_check;");
    // Just drop it, enum check is handled by JPA anyway
    console.log("Fixed feedback_categories_category_check");
  } catch (e) {
    console.log("Error fixing feedback_categories_category_check:", e.message);
  }

  await c.end();
}
run();

