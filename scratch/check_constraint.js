
const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:1234@localhost:5432/catering" });
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conname = 'bookings_status_check';
  `);
  console.log("Constraint:", res.rows[0]);
  await client.end();
}
run().catch(console.error);

