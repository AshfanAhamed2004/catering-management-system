
const { Client } = require("pg");
async function run() {
  const client = new Client({ connectionString: "postgresql://postgres:1234@localhost:5432/catering" });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'feedback';");
  console.log(res.rows);
  await client.end();
}
run();

