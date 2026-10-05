
const { Client } = require('pg');
const DB_URL = 'postgres://postgres:1234@localhost:5432/catering';

async function runTests() {
  const db = new Client({ connectionString: DB_URL });
  await db.connect();

  let results = { pass: [], fail: [], warnings: [] };
  let createdUsers = [];

  try {
    await db.query(DELETE FROM customer_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test_%_temp@example.com'));
    await db.query(DELETE FROM users WHERE email LIKE 'test_%_temp@example.com');

    // Register a temp customer
    const custRes = await fetch('http://localhost:8000/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_cust_temp@example.com', password: 'Password123!', password_confirmation: 'Password123!', full_name: 'Test Cust', mobile_number: '0712345678', address: '123 Test St' })
    });
    createdUsers.push('test_cust_temp@example.com');
    
    const custLogin = await fetch('http://localhost:8000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test_cust_temp@example.com', password: 'Password123!' })
    });
    const custData = await custLogin.json();
    const custToken = custData.access_token;
    
    const custHashRes = await db.query(SELECT password_hash FROM users WHERE email = 'test_cust_temp@example.com');
    const validHash = custHashRes.rows[0].password_hash;

    const gmInsert = await db.query(
      INSERT INTO users (email, password_hash, role, active, token_version) VALUES ('test_gm_temp@example.com', , 'GENERAL_MANAGER', true, 0) RETURNING id, [validHash]
    );
    const gmId = gmInsert.rows[0].id;
    await db.query(INSERT INTO customer_profiles (user_id, full_name, mobile_number, address) VALUES (, 'GM User', '0700000000', ''), [gmId]);
    createdUsers.push('test_gm_temp@example.com');

    const gmLogin = await fetch('http://localhost:8000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test_gm_temp@example.com', password: 'Password123!' })
    });
    const gmData = await gmLogin.json();
    const gmToken = gmData.access_token;

    // Finance Officer
    const finRes = await fetch('http://localhost:8000/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ fullName: 'Finance User', email: 'test_fin_temp@example.com', password: 'Password123!', role: 'FINANCE_OFFICER' })
    });
    createdUsers.push('test_fin_temp@example.com');
    
    const finLogin = await fetch('http://localhost:8000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test_fin_temp@example.com', password: 'Password123!' })
    });
    const finData = await finLogin.json();
    const finToken = finData.access_token;

    // Head Chef
    const hcRes = await fetch('http://localhost:8000/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ fullName: 'Chef User', email: 'test_chef_temp@example.com', password: 'Password123!', role: 'HEAD_CHEF' })
    });
    createdUsers.push('test_chef_temp@example.com');
    const hcData = await hcRes.json();
    const chefId = hcData.id;
    
    const chefLogin = await fetch('http://localhost:8000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test_chef_temp@example.com', password: 'Password123!' })
    });
    const chefData = await chefLogin.json();
    const chefToken = chefData.access_token;

    // TESTS
    const r1 = await fetch('http://localhost:8000/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ fullName: 'X', email: 'x@x.com', password: 'Password123!', role: 'HEAD_CHEF' })
    });
    if (r1.status === 403) results.pass.push('Customer got 403 on staff creation');
    else results.fail.push('Customer got ' + r1.status);

    const r2 = await fetch('http://localhost:8000/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ fullName: 'X', email: 'x@x.com', password: 'Password123!', role: 'HEAD_CHEF' })
    });
    if (r2.status === 403) results.pass.push('Finance got 403 on staff creation');
    else results.fail.push('Finance got ' + r2.status);

    const r3 = await fetch('http://localhost:8000/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ fullName: 'X', email: 'x@x.com', password: 'Password123!', role: 'CUSTOMER' })
    });
    if (r3.status === 400) results.pass.push('GM blocked from creating CUSTOMER');
    else results.fail.push('GM got ' + r3.status);

    const r4 = await fetch('http://localhost:8000/auth/me', { headers: { 'Authorization': Bearer  } });
    const r4d = await r4.json();
    if (r4d.role === 'FINANCE_OFFICER') results.pass.push('Finance /auth/me returns correct role');
    
    // Deactivation
    const r5 = await fetch(http://localhost:8000/admin/users/, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ role: 'HEAD_CHEF', isActive: false })
    });
    
    const r6 = await fetch('http://localhost:8000/auth/me', { headers: { 'Authorization': Bearer  } });
    if (r6.status === 403) results.pass.push('Deactivated chef JWT rejected');

    const r7 = await fetch(http://localhost:8000/admin/users/, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': Bearer  },
      body: JSON.stringify({ role: 'GENERAL_MANAGER', isActive: false })
    });
    if (r7.status === 409) results.pass.push('GM self-deactivation blocked (409)');

  } catch(e) {
    console.error('Error during testing', e);
  } finally {
    for (let email of createdUsers) {
      await db.query(DELETE FROM customer_profiles WHERE user_id IN (SELECT id FROM users WHERE email = ), [email]);
      await db.query(DELETE FROM users WHERE email = , [email]);
    }
    await db.end();
  }
  console.log(JSON.stringify(results, null, 2));
}

runTests();

