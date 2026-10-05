
const { Client } = require("pg");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  await client.query("UPDATE users SET role = 'WAITER' WHERE email LIKE 'waiter%'");
  await client.query("UPDATE users SET role = 'CLEANER' WHERE email LIKE 'cleaner%'");
  await client.query("UPDATE users SET role = 'CHEF' WHERE email LIKE 'chef%'");
  
  const res = await client.query("SELECT email, role FROM users WHERE role IN ('WAITER', 'CLEANER', 'CHEF')");
  console.log("Updated users:", res.rows);
  
  await client.end();
}

run().catch(console.error);

