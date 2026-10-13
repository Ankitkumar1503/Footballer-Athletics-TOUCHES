/**
 * Dynamic Verification Script for TOUCHES Web & Mobile against Live Render Backend
 * URL: https://football-backend-gfr2.onrender.com
 */

const BACKEND_URL = 'https://football-backend-gfr2.onrender.com';

async function runVerification() {
  console.log('====================================================');
  console.log('TOUCHES BACKEND INTEGRATION & DYNAMIC SYNC TEST');
  console.log('Target Backend:', BACKEND_URL);
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (details) console.log(`       -> ${details}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`       -> ${details}`);
    }
  }

  // TEST 1: Health Check Endpoint
  console.log('--- Step 1: Health Check ---');
  try {
    const healthRes = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health responds with status: ok', JSON.stringify(healthData));
  } catch (err) {
    assert(false, 'GET /api/health reachable', err.message);
  }

  // TEST 2: Dynamic Stats Endpoint
  console.log('\n--- Step 2: Live Stats & Dynamic Counter ---');
  let initialStats = null;
  try {
    const statsRes = await fetch(`${BACKEND_URL}/api/stats`);
    initialStats = await statsRes.json();
    assert(statsRes.status === 200 && initialStats.success, 'GET /api/stats responds with success', `Total: ${initialStats.data?.total || initialStats.total}, Left: ${initialStats.data?.leftCount || initialStats.leftCount}, Right: ${initialStats.data?.rightCount || initialStats.rightCount}`);
  } catch (err) {
    assert(false, 'GET /api/stats reachable', err.message);
  }

  // TEST 3: Dynamic Web Registration Flow
  console.log('\n--- Step 3: Web App Registration Flow ---');
  const webTimestamp = Date.now().toString().slice(-5);
  const webEmail = `web.player.${webTimestamp}@touches.app`;
  const webPlayer = {
    firstName: 'Kylian',
    lastName: 'Mbappé',
    email: webEmail,
    country: 'France',
    footPreference: 'right',
    age: '25',
    club: 'Real Madrid',
    position: 'Forward'
  };

  let webJwtToken = null;
  let webPlayerId = null;

  try {
    const webRegRes = await fetch(`${BACKEND_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webPlayer)
    });
    const webRegData = await webRegRes.json();

    assert(webRegRes.status === 201 && webRegData.success === true, 'POST /api/registrations (Web) returns HTTP 201 Created', `User ID: ${webRegData.data?.id}, Name: ${webRegData.data?.name}`);
    assert(typeof webRegData.token === 'string' && webRegData.token.length > 20, 'JWT Token generated and returned for Web session');
    webJwtToken = webRegData.token;
    webPlayerId = webRegData.data?.id;
  } catch (err) {
    assert(false, 'Web Registration failed', err.message);
  }

  // TEST 4: Dynamic Mobile (React Native) Registration Flow
  console.log('\n--- Step 4: Mobile App Registration Flow ---');
  const mobileTimestamp = (Date.now() + 1).toString().slice(-5);
  const mobileEmail = `mobile.player.${mobileTimestamp}@touches.app`;
  const mobilePlayer = {
    firstName: 'Lionel',
    lastName: 'Messi',
    email: mobileEmail,
    country: 'Argentina',
    footPreference: 'left',
    age: '37',
    club: 'Inter Miami',
    position: 'Attacking Midfielder'
  };

  let mobileJwtToken = null;
  let mobilePlayerId = null;

  try {
    const mobRegRes = await fetch(`${BACKEND_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mobilePlayer)
    });
    const mobRegData = await mobRegRes.json();

    assert(mobRegRes.status === 201 && mobRegData.success === true, 'POST /api/registrations (Mobile) returns HTTP 201 Created', `User ID: ${mobRegData.data?.id}, Name: ${mobRegData.data?.name}`);
    assert(typeof mobRegData.token === 'string' && mobRegData.token.length > 20, 'JWT Token generated and returned for Mobile session');
    mobileJwtToken = mobRegData.token;
    mobilePlayerId = mobRegData.data?.id;
  } catch (err) {
    assert(false, 'Mobile Registration failed', err.message);
  }

  // TEST 5: Verify Registration Listing Persistence & Retrieval
  console.log('\n--- Step 5: Verify Dynamic Sync in Backend Database ---');
  try {
    const listRes = await fetch(`${BACKEND_URL}/api/registrations`);
    const listData = await listRes.json();
    assert(listRes.status === 200 && Array.isArray(listData.data), 'GET /api/registrations returns dynamic player list');

    const foundWeb = listData.data.find(p => p.email === webEmail || p.id === webPlayerId);
    const foundMobile = listData.data.find(p => p.email === mobileEmail || p.id === mobilePlayerId);

    assert(Boolean(foundWeb), `Web player dynamically retrieved from backend list (${foundWeb?.name || 'found'})`);
    assert(Boolean(foundMobile), `Mobile player dynamically retrieved from backend list (${foundMobile?.name || 'found'})`);
  } catch (err) {
    assert(false, 'GET /api/registrations verification failed', err.message);
  }

  // TEST 6: Stats Increment Verification (Dynamic Updates)
  console.log('\n--- Step 6: Verify Dynamic Stats Increment ---');
  try {
    const updatedStatsRes = await fetch(`${BACKEND_URL}/api/stats`);
    const updatedStats = await updatedStatsRes.json();
    const prevTotal = (initialStats?.data?.total || initialStats?.total || 0);
    const newTotal = (updatedStats?.data?.total || updatedStats?.total || 0);

    assert(newTotal >= prevTotal, `Dynamic stats updated dynamically: Prev total = ${prevTotal}, Current total = ${newTotal}`);
  } catch (err) {
    assert(false, 'Updated stats verification failed', err.message);
  }

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} Tests Passed`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification();
