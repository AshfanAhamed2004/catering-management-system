
const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:1234@localhost:5432/catering" });
async function run() {
  await client.connect();
  const res = await client.query(`
    UPDATE bookings 
    SET status = 'APPROVED'
    WHERE status = 'COMPLETED';
  `);
  console.log("Reverted bookings:", res.rowCount);
  await client.end();
}
run().catch(console.error);

