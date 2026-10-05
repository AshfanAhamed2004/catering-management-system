
const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:1234@localhost:5432/catering" });
async function run() {
  await client.connect();
  
  // 1. Drop the constraint
  await client.query(`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;`);
  
  // 2. Re-add the constraint with COMPLETED
  await client.query(`
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'));
  `);
  
  // 3. Update the stuck bookings
  const res = await client.query(`
    UPDATE bookings 
    SET status = 'COMPLETED'
    WHERE id IN (
      SELECT booking_id 
      FROM invoices 
      WHERE status = 'Paid'
    )
    RETURNING id, status;
  `);
  
  console.log("Updated bookings:", res.rows);
  await client.end();
}
run().catch(console.error);

