
const { Client } = require("pg");
const bcrypt = require("bcrypt");

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:1234@localhost:5432/catering"
  });
  await client.connect();
  
  const hash = await bcrypt.hash("password123", 10);
  
  const staffsToSeed = [
    { email: "waiter2@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "Sarah Connor (Waiter)" },
    { email: "waiter3@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "John Smith (Waiter)" },
    { email: "waiter4@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "Emily Blunt (Waiter)" },
    { email: "cleaner2@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "Tom Hanks (Cleaner)" },
    { email: "cleaner3@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "Julia Roberts (Cleaner)" },
    { email: "cleaner4@smartserve.com", role: "EVENT_COORDINATION_OFFICER", name: "Brad Pitt (Cleaner)" },
    { email: "chef2@smartserve.com", role: "HEAD_CHEF", name: "Gordon Ramsay (Chef)" },
    { email: "chef3@smartserve.com", role: "HEAD_CHEF", name: "Jamie Oliver (Chef)" },
    { email: "chef4@smartserve.com", role: "HEAD_CHEF", name: "Nigella Lawson (Chef)" },
    { email: "chef5@smartserve.com", role: "HEAD_CHEF", name: "Bobby Flay (Chef)" }
  ];

  for (const s of staffsToSeed) {
    try {
      const res = await client.query(
        "INSERT INTO users (email, password_hash, role, active, token_version, created_at, updated_at) VALUES ($1, $2, $3, true, 0, NOW(), NOW()) RETURNING id",
        [s.email, hash, s.role]
      );
      await client.query(
        "INSERT INTO customer_profiles (user_id, full_name, mobile_number, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())",
        [res.rows[0].id, s.name, "555-0000"]
      );
      console.log("Seeded:", s.name);
    } catch(e) {
      console.error("Failed for", s.name, e.message);
    }
  }

  console.log("Seeded all new staff!");
  await client.end();
}

run().catch(console.error);

