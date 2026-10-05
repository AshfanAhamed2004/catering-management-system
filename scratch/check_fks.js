
const { Client } = require("pg");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT conname, conrelid::regclass, confrelid::regclass
    FROM pg_constraint
    WHERE confrelid = 'users'::regclass;
  `);
  console.log(res.rows);
  await client.end();
}

run().catch(console.error);

