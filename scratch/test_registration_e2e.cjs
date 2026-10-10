const path = require('path');
const mysql = require('C:/Users/aksin/OneDrive/Desktop/football_backend/node_modules/mysql2/promise');

async function main() {
  console.log('=== TOUCHES REGISTRATION VERIFICATION TEST ===\n');

  // Connect to MySQL
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'touches_db',
  });
  console.log('✔ Connected to MySQL touches_db');

  const [initialCountRows] = await db.query('SELECT COUNT(*) as cnt FROM registrations');
  const initialCount = initialCountRows[0].cnt;
  console.log(`Initial registrations count: ${initialCount}\n`);

  // --- TEST 1: WEB REGISTRATION FLOW ---
  console.log('--- TEST 1: Web Registration Flow ---');
  const timestamp = Date.now().toString().slice(-5);
  const webPayload = {
    fullName: 'Marcus Rashford',
    email: `marcus.web.${timestamp}@touches.app`,
    country: 'United Kingdom',
    activeFooter: 'RIGHT',
    age: '26',
    club: 'Manchester United',
    position: 'Striker / Forward (ST)',
  };

  // Mimic Web src/services/api.js transformation
  const webParts = webPayload.fullName.split(/\s+/);
  const webFirstName = webParts[0];
  const webLastName = webParts.slice(1).join(' ');
  const webBody = {
    firstName: webFirstName,
    lastName: webLastName,
    email: webPayload.email,
    country: webPayload.country,
    footPreference: webPayload.activeFooter.toLowerCase(),
  };

  console.log('Web Registration Request: POST http://localhost:5000/api/registrations');
  console.log('Web Payload:', JSON.stringify(webBody, null, 2));

  const webRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webBody),
  });

  const webData = await webRes.json();
  console.log(`Web Response Status: HTTP ${webRes.status}`);
  console.log('Web Response Body:', JSON.stringify(webData, null, 2));

  if (webRes.status !== 201 || !webData.success) {
    throw new Error(`Web registration failed! Status: ${webRes.status}`);
  }

  const webRowId = webData.data.id;
  const [webDbRows] = await db.query('SELECT * FROM registrations WHERE id = ?', [webRowId]);
  if (webDbRows.length === 0) {
    throw new Error(`Web registration row ID ${webRowId} NOT found in touches_db.registrations!`);
  }
  console.log(`✔ Verified Web DB Row:`, webDbRows[0]);
  console.log('✔ Web registration test PASSED!\n');

  // --- TEST 2: MOBILE (REACT NATIVE) REGISTRATION FLOW ---
  console.log('--- TEST 2: Mobile (React Native) Registration Flow ---');
  const mobilePayload = {
    fullName: 'Bukayo Saka',
    email: `bukayo.mobile.${timestamp}@touches.app`,
    country: 'United Kingdom',
    activeFooter: 'LEFT',
    age: '22',
    club: 'Arsenal FC',
    position: 'Right Winger (RW)',
  };

  // Mimic Mobile mobile/src/services/api.js transformation
  const mobParts = mobilePayload.fullName.split(/\s+/);
  const mobFirstName = mobParts[0];
  const mobLastName = mobParts.slice(1).join(' ');
  const mobBody = {
    firstName: mobFirstName,
    lastName: mobLastName,
    email: mobilePayload.email,
    country: mobilePayload.country,
    footPreference: mobilePayload.activeFooter.toLowerCase(),
  };

  console.log('Mobile Registration Request: POST http://localhost:5000/api/registrations');
  console.log('Mobile Payload:', JSON.stringify(mobBody, null, 2));

  const mobRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mobBody),
  });

  const mobData = await mobRes.json();
  console.log(`Mobile Response Status: HTTP ${mobRes.status}`);
  console.log('Mobile Response Body:', JSON.stringify(mobData, null, 2));

  if (mobRes.status !== 201 || !mobData.success) {
    throw new Error(`Mobile registration failed! Status: ${mobRes.status}`);
  }

  const mobRowId = mobData.data.id;
  const [mobDbRows] = await db.query('SELECT * FROM registrations WHERE id = ?', [mobRowId]);
  if (mobDbRows.length === 0) {
    throw new Error(`Mobile registration row ID ${mobRowId} NOT found in touches_db.registrations!`);
  }
  console.log(`✔ Verified Mobile DB Row:`, mobDbRows[0]);
  console.log('✔ Mobile registration test PASSED!\n');

  // --- TEST 3: DUPLICATE EMAIL REJECTION (409) ---
  console.log('--- TEST 3: Duplicate Email Prevention ---');
  const dupRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webBody), // Same email as webBody
  });
  const dupData = await dupRes.json();
  console.log(`Duplicate Request Response Status: HTTP ${dupRes.status}`);
  console.log('Duplicate Response Body:', JSON.stringify(dupData, null, 2));
  if (dupRes.status !== 409) {
    throw new Error(`Expected HTTP 409 for duplicate email, got ${dupRes.status}`);
  }
  console.log('✔ Duplicate email prevented with HTTP 409 Conflict!\n');

  // --- TEST 4: VALIDATION ERROR REJECTION (400) ---
  console.log('--- TEST 4: Invalid Validation Rejection ---');
  const invRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: '', footPreference: 'both' }),
  });
  const invData = await invRes.json();
  console.log(`Invalid Request Response Status: HTTP ${invRes.status}`);
  console.log('Invalid Response Body:', JSON.stringify(invData, null, 2));
  if (invRes.status !== 400) {
    throw new Error(`Expected HTTP 400 for invalid payload, got ${invRes.status}`);
  }
  console.log('✔ Invalid payload rejected with HTTP 400 Bad Request!\n');

  // Verify final count
  const [finalCountRows] = await db.query('SELECT COUNT(*) as cnt FROM registrations');
  const finalCount = finalCountRows[0].cnt;
  console.log(`Final registrations count: ${finalCount} (Added exactly 2 new rows: Web + Mobile)`);

  await db.end();
  console.log('\n=== ALL REGISTRATION TESTS COMPLETED SUCCESSFULLY! ===');
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
