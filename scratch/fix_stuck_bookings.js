
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:1234@localhost:5432/catering"
});

async function run() {
  await client.connect();
  
  // Find all paid invoices and update their bookings to COMPLETED
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

