
const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "catering",
  password: "1234",
  port: 5432,
});

async function run() {
  await client.connect();
  const res = await client.query("UPDATE packages SET name = 'Artisan Tapas Soiree' WHERE name LIKE '%Artisan Tapas%'");
  console.log("Updated", res.rowCount, "packages");
  await client.end();
}
run();

