
const { Client } = require("pg");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  // Find the package
  const res = await client.query("SELECT id, name FROM packages WHERE name LIKE '%Artisan%'");
  console.log("Packages:", res.rows);
  
  if (res.rows.length > 0) {
    const id = res.rows[0].id;
    await client.query("UPDATE packages SET name = 'Artisan Tapas Soiree' WHERE id = $1", [id]);
    console.log("Updated package", id);
  }
  
  await client.end();
}

run().catch(console.error);

