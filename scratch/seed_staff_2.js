
const { Client } = require("pg");
const bcrypt = require("bcrypt");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  const hash = await bcrypt.hash("password123", 10);
  
  // Waiter
  const res1 = await client.query(
    "INSERT INTO users (email, password_hash, role, active, token_version, created_at, updated_at) VALUES ($1, $2, $3, true, 0, NOW(), NOW()) RETURNING id",
    ["waiter1@smartserve.com", hash, "EVENT_COORDINATION_OFFICER"]
  );
  await client.query("INSERT INTO customer_profiles (user_id, first_name, last_name, phone_number, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())", [res1.rows[0].id, "Michael", "Scott (Waiter)", "555-0101"]);

  // Cleaner
  const res2 = await client.query(
    "INSERT INTO users (email, password_hash, role, active, token_version, created_at, updated_at) VALUES ($1, $2, $3, true, 0, NOW(), NOW()) RETURNING id",
    ["cleaner1@smartserve.com", hash, "EVENT_COORDINATION_OFFICER"]
  );
  await client.query("INSERT INTO customer_profiles (user_id, first_name, last_name, phone_number, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())", [res2.rows[0].id, "Dwight", "Schrute (Cleaner)", "555-0102"]);

  // Cook
  const res3 = await client.query(
    "INSERT INTO users (email, password_hash, role, active, token_version, created_at, updated_at) VALUES ($1, $2, $3, true, 0, NOW(), NOW()) RETURNING id",
    ["cook1@smartserve.com", hash, "HEAD_CHEF"]
  );
  await client.query("INSERT INTO customer_profiles (user_id, first_name, last_name, phone_number, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())", [res3.rows[0].id, "Jim", "Halpert (Cook)", "555-0103"]);
  
  console.log("Seeded staff!");
  await client.end();
}

run().catch(console.error);

