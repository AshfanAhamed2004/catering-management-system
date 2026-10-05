
const { Client } = require("pg");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  // Find bookings
  const res = await client.query("SELECT id, package_name FROM bookings WHERE package_name LIKE '%Artisan%'");
  console.log("Bookings:", res.rows);
  
  for (const b of res.rows) {
    await client.query("UPDATE bookings SET package_name = 'Artisan Tapas Soiree' WHERE id = $1", [b.id]);
    console.log("Updated booking", b.id);
  }
  
  await client.end();
}

run().catch(console.error);

