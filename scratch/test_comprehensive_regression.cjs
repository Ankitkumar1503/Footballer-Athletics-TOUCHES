const assert = require('assert');
const mysql = require('C:/Users/aksin/OneDrive/Desktop/football_backend/node_modules/mysql2/promise');

// 1. STATS CALCULATION LOGIC (Identical in Web useActiveSession & Mobile useActiveSession)
function calculateSessionStats(touches) {
  const INDEPENDENT_EVENTS = [
    'Goal',
    'Yellow Card',
    'Red Card',
    'Missed Game',
    'Sub In',
    'Sub Out',
    'Injury',
    'Keep-Up-Feet',
    'Keep-Up-Head',
  ];

  const initial = {
    total: 0,
    good: 0,
    bad: 0,
    unrated: 0,
    Pass: 0,
    Dribble: 0,
    'Corner Kick': 0,
    Header: 0,
    Tackle: 0,
    Goal: 0,
    Shot: 0,
    'Free Kick': 0,
    'Penalty Kick': 0,
    Penalty: 0,
    'Throw-In': 0,
    'Yellow Card': 0,
    'Red Card': 0,
    'Missed Game': 0,
    'Sub In': 0,
    'Sub Out': 0,
    Injury: 0,
    'Keep-Up-Feet': 0,
    'Keep-Up-Head': 0,
  };

  return touches.reduce((acc, touch) => {
    const isIndependent = INDEPENDENT_EVENTS.includes(touch.actionType) || touch.quality === 'Event';

    if (!isIndependent) {
      acc.total++;
      if (touch.quality === 'Positive') {
        acc.good++;
      } else if (touch.quality === 'Negative') {
        acc.bad++;
      } else {
        acc.unrated++;
      }
    }

    if (touch.actionType) {
      acc[touch.actionType] = (acc[touch.actionType] || 0) + 1;
      if (touch.actionType === 'Penalty Kick') {
        acc.Penalty = (acc.Penalty || 0) + 1;
      } else if (touch.actionType === 'Penalty') {
        acc['Penalty Kick'] = (acc['Penalty Kick'] || 0) + 1;
      }
    }
    return acc;
  }, initial);
}

// 2. 30-DAY CHALLENGE PROGRESS CALCULATION LOGIC
function calculateChallengeProgress(completedDays) {
  const totalDays = 30;
  const completedCount = completedDays.length;
  const percent = Math.round((completedCount / totalDays) * 100);
  return { completedCount, percent };
}

async function runRegressionSuite() {
  console.log('====================================================');
  console.log('TOUCHES COMPREHENSIVE REGRESSION & INTEGRATION SUITE');
  console.log('====================================================\n');

  // --- SECTION A: FOOTBALL STATS BUSINESS RULES ---
  console.log('--- A. FOOTBALL STATS BUSINESS RULES ---');

  // Rule 1: Goals as distinct events - No double counting
  const matchTouches1 = [
    { actionType: 'Pass', quality: 'Positive' },
    { actionType: 'Dribble', quality: null },      // unrated touch
    { actionType: 'Shot', quality: 'Positive' },   // shot on target
    { actionType: 'Goal', quality: 'Event' },      // goal event on the same play
  ];
  const stats1 = calculateSessionStats(matchTouches1);
  assert.strictEqual(stats1.total, 3, 'Total touches must be 3 (Pass, Dribble, Shot) - Goal is an event, not an extra touch');
  assert.strictEqual(stats1.Shot, 1, 'Shot count is 1');
  assert.strictEqual(stats1.Goal, 1, 'Goal count is 1');
  assert.strictEqual(stats1.good, 2, 'Good touches: 2 (Pass, Shot)');
  assert.strictEqual(stats1.unrated, 1, 'Unrated touches: 1 (Dribble)');
  assert.strictEqual(stats1.bad, 0, 'Bad touches: 0');
  console.log('✔ Rule 1: Goal recorded as distinct event without double-counting touches.');

  // Rule 2: Penalty kicks count as touches
  const matchTouches2 = [
    { actionType: 'Penalty', quality: 'Positive' }, // penalty kick scored
    { actionType: 'Goal', quality: 'Event' },       // goal event recorded
  ];
  const stats2 = calculateSessionStats(matchTouches2);
  assert.strictEqual(stats2.total, 1, 'Scored penalty must be counted as exactly 1 touch');
  assert.strictEqual(stats2.Penalty, 1, 'Penalty count is 1');
  assert.strictEqual(stats2.Goal, 1, 'Goal count is 1');
  assert.strictEqual(stats2.good, 1, 'Good count is 1');
  console.log('✔ Rule 2: Penalty kicks correctly count as ball touches without duplicate count.');

  // Rule 3: Shots count includes all shots (including misses)
  const matchTouches3 = [
    { actionType: 'Shot', quality: 'Positive' }, // on target
    { actionType: 'Shot', quality: 'Negative' }, // missed / blocked
    { actionType: 'Shot', quality: null },       // unrated shot
  ];
  const stats3 = calculateSessionStats(matchTouches3);
  assert.strictEqual(stats3.Shot, 3, 'Total shots must include misses and unrated shots');
  assert.strictEqual(stats3.total, 3, 'Total touches from shots is 3');
  assert.strictEqual(stats3.good, 1, 'Positive shots: 1');
  assert.strictEqual(stats3.bad, 1, 'Negative shots: 1');
  assert.strictEqual(stats3.unrated, 1, 'Unrated shots: 1');
  console.log('✔ Rule 3: Shots calculation includes all shots and misses without label-only mismatch.');

  // Rule 4: Unrated touches do not count as positive or negative
  const matchTouches4 = [
    { actionType: 'Pass', quality: null },
    { actionType: 'Dribble', quality: null },
    { actionType: 'Tackle', quality: null },
    { actionType: 'Header', quality: 'Positive' },
  ];
  const stats4 = calculateSessionStats(matchTouches4);
  assert.strictEqual(stats4.total, 4, 'Total touches is 4');
  assert.strictEqual(stats4.unrated, 3, '3 unrated touches');
  assert.strictEqual(stats4.good, 1, 'Only 1 positive touch');
  assert.strictEqual(stats4.bad, 0, '0 negative touches');
  const positiveRate = Math.round((stats4.good / stats4.total) * 100);
  assert.strictEqual(positiveRate, 25, 'Positive accuracy is 25% (1/4), unrated not falsely credited as positive');
  console.log('✔ Rule 4: Unrated touches remain neutral until explicitly rated.\n');

  // --- SECTION B: DATA PERSISTENCE & CHALLENGE PROGRESS ---
  console.log('--- B. SESSION & CHALLENGE PROGRESS INTEGRITY ---');
  const completedDays = [1, 2, 3, 4, 5];
  const challengeState = calculateChallengeProgress(completedDays);
  assert.strictEqual(challengeState.completedCount, 5, 'Completed days is 5');
  assert.strictEqual(challengeState.percent, 17, 'Percent progress is 17% (5/30)');
  console.log('✔ Challenge progress and session structures calculate correctly.\n');

  // --- SECTION C: BACKEND INTEGRATION & DATABASE VERIFICATION ---
  console.log('--- C. LIVE BACKEND & MYSQL TOUCHES_DB TESTS ---');
  const db = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'touches_db',
  });
  console.log('✔ Connected to MySQL touches_db');

  // Health endpoint test
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  assert.strictEqual(healthRes.status, 200, 'Health endpoint must return HTTP 200');
  assert.strictEqual(healthData.service, 'touches-backend-api');
  console.log('✔ GET /api/health returned HTTP 200 OK');

  // Web registration test
  const webEmail = `reg.web.${Date.now()}@touches.app`;
  const webRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Declan',
      lastName: 'Rice',
      email: webEmail,
      country: 'United Kingdom',
      footPreference: 'right',
    }),
  });
  const webData = await webRes.json();
  assert.strictEqual(webRes.status, 201, 'Web registration must return HTTP 201');
  const webId = webData.data.id;
  const [webRows] = await db.query('SELECT id, firstName, lastName, email FROM registrations WHERE id = ?', [webId]);
  assert.strictEqual(webRows.length, 1, 'Web registration must exist in MySQL');
  console.log(`✔ Web Registration verified in MySQL (ID: ${webId}, Player: ${webRows[0].firstName} ${webRows[0].lastName})`);

  // Mobile registration test
  const mobEmail = `reg.mob.${Date.now()}@touches.app`;
  const mobRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Martin',
      lastName: 'Odegaard',
      email: mobEmail,
      country: 'Norway',
      footPreference: 'left',
    }),
  });
  const mobData = await mobRes.json();
  assert.strictEqual(mobRes.status, 201, 'Mobile registration must return HTTP 201');
  const mobId = mobData.data.id;
  const [mobRows] = await db.query('SELECT id, firstName, lastName, email FROM registrations WHERE id = ?', [mobId]);
  assert.strictEqual(mobRows.length, 1, 'Mobile registration must exist in MySQL');
  console.log(`✔ Mobile Registration verified in MySQL (ID: ${mobId}, Player: ${mobRows[0].firstName} ${mobRows[0].lastName})`);

  // Duplicate email prevention
  const dupRes = await fetch('http://localhost:5000/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Declan',
      lastName: 'Rice',
      email: webEmail, // Duplicate
      country: 'United Kingdom',
      footPreference: 'right',
    }),
  });
  assert.strictEqual(dupRes.status, 409, 'Duplicate email must return HTTP 409 Conflict');
  console.log('✔ Duplicate email prevented with HTTP 409 Conflict');

  // Server-side account deletion test
  const delRes = await fetch('http://localhost:5000/api/auth/account', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${webData.token}`,
    },
  });
  assert.strictEqual(delRes.status, 200, 'Account deletion must return HTTP 200');
  const [delRows] = await db.query('SELECT id FROM registrations WHERE id = ?', [webId]);
  assert.strictEqual(delRows.length, 0, 'User row must be removed from MySQL');
  console.log(`✔ Server-side account deletion verified in MySQL (Row ID ${webId} permanently deleted)`);

  await db.end();
  console.log('\n====================================================');
  console.log('ALL REGRESSION & INTEGRATION TESTS PASSED (100%)');
  console.log('====================================================');
}

runRegressionSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
