const assert = require('assert');

// Test the exact calculation logic matching both Web and Mobile useActiveSession / useCumulativeStats
function calculateStats(touches) {
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

  const initialStats = {
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

  if (!touches || touches.length === 0) {
    return initialStats;
  }

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
  }, initialStats);
}

console.log('--- RUNNING FOOTBALL LOGIC TESTS ---');

// Test 1: Goals as distinct events - No double-counting
console.log('Test 1: Goals logic...');
{
  // A goal recorded alone
  const statsGoalOnly = calculateStats([
    { actionType: 'Goal', quality: 'Event' }
  ]);
  assert.strictEqual(statsGoalOnly.total, 0, 'Goal event should NOT increment total touches');
  assert.strictEqual(statsGoalOnly.Goal, 1, 'Goal event should increment Goal count');

  // Shot + Goal scored on the same play
  const statsShotAndGoal = calculateStats([
    { actionType: 'Shot', quality: 'Positive' },
    { actionType: 'Goal', quality: 'Event' }
  ]);
  assert.strictEqual(statsShotAndGoal.total, 1, 'Shot + Goal should result in exactly 1 touch, not 2');
  assert.strictEqual(statsShotAndGoal.Shot, 1, 'Shot count should be 1');
  assert.strictEqual(statsShotAndGoal.Goal, 1, 'Goal count should be 1');
  assert.strictEqual(statsShotAndGoal.good, 1, 'Good count should be 1');
  console.log('✓ Test 1 passed: Goal is a distinct event, Shot + Goal does not double-count touches.');
}

// Test 2: Penalties - Ball touch recorded, event tracked, no duplicates
console.log('Test 2: Penalty logic...');
{
  // Penalty kick taken
  const statsPenalty = calculateStats([
    { actionType: 'Penalty', quality: null }
  ]);
  assert.strictEqual(statsPenalty.total, 1, 'Penalty kick MUST count as a player ball touch');
  assert.strictEqual(statsPenalty.Penalty, 1, 'Penalty count should be 1');
  assert.strictEqual(statsPenalty.unrated, 1, 'Unrated penalty touch should increment unrated');

  // Scored penalty: Penalty kick taken + Goal event
  const statsScoredPenalty = calculateStats([
    { actionType: 'Penalty', quality: 'Positive' },
    { actionType: 'Goal', quality: 'Event' }
  ]);
  assert.strictEqual(statsScoredPenalty.total, 1, 'Scored penalty should count as 1 touch total');
  assert.strictEqual(statsScoredPenalty.Penalty, 1, 'Penalty count should be 1');
  assert.strictEqual(statsScoredPenalty.Goal, 1, 'Goal count should be 1');

  // Penalty event recorded alongside Shot event (quality: 'Event')
  const statsPenaltyEventAndShot = calculateStats([
    { actionType: 'Shot', quality: null },
    { actionType: 'Penalty', quality: 'Event' }
  ]);
  assert.strictEqual(statsPenaltyEventAndShot.total, 1, 'Shot touch + Penalty event should not duplicate touches');
  assert.strictEqual(statsPenaltyEventAndShot.Shot, 1, 'Shot count should be 1');
  assert.strictEqual(statsPenaltyEventAndShot.Penalty, 1, 'Penalty count should be 1');

  // Missed penalty: Penalty kick taken, no Goal
  const statsMissedPenalty = calculateStats([
    { actionType: 'Penalty', quality: 'Negative' }
  ]);
  assert.strictEqual(statsMissedPenalty.total, 1, 'Missed penalty is 1 touch');
  assert.strictEqual(statsMissedPenalty.Penalty, 1, 'Penalty count is 1');
  assert.strictEqual(statsMissedPenalty.Goal, 0, 'No goal recorded');
  assert.strictEqual(statsMissedPenalty.bad, 1, 'Bad count is 1');
  console.log('✓ Test 2 passed: Penalty correctly records ball touch, tracks penalty event, and handles scored/missed.');
}

// Test 3: Shots - Missed shots and all shots counted
console.log('Test 3: Shots logic...');
{
  const statsShots = calculateStats([
    { actionType: 'Shot', quality: 'Positive' }, // on-target
    { actionType: 'Shot', quality: 'Negative' }, // missed shot
    { actionType: 'Shot', quality: null },       // unrated shot
  ]);
  assert.strictEqual(statsShots.Shot, 3, 'All shots including misses must be counted');
  assert.strictEqual(statsShots.total, 3, 'Each shot is a ball touch');
  console.log('✓ Test 3 passed: All shots including missed shots correctly counted.');
}

// Test 4: Touch ratings - Unrated default, no auto-Positive, rating summaries
console.log('Test 4: Touch ratings & unrated logic...');
{
  const statsRatings = calculateStats([
    { actionType: 'Pass', quality: null },      // unrated touch
    { actionType: 'Dribble', quality: null },   // unrated touch
    { actionType: 'Pass', quality: 'Positive' }, // positive touch
    { actionType: 'Tackle', quality: 'Negative' }, // negative touch
  ]);

  assert.strictEqual(statsRatings.total, 4, 'Total touches should be 4');
  assert.strictEqual(statsRatings.unrated, 2, 'Unrated touches should be 2');
  assert.strictEqual(statsRatings.good, 1, 'Positive touches should be 1');
  assert.strictEqual(statsRatings.bad, 1, 'Negative touches should be 1');

  // Verify positive percentage calculation ignores unrated touches from positive count
  const positivePercent = statsRatings.total > 0 ? Math.round((statsRatings.good / statsRatings.total) * 100) : 0;
  assert.strictEqual(positivePercent, 25, '1 out of 4 is 25% positive');
  console.log('✓ Test 4 passed: Unrated touches do not count as positive or negative.');
}

// Test 5: Existing session data integrity & unrelated counters
console.log('Test 5: Unrelated counters and session data preservation...');
{
  const statsComprehensive = calculateStats([
    { actionType: 'Pass', quality: 'Positive' },
    { actionType: 'Dribble', quality: 'Positive' },
    { actionType: 'Corner Kick', quality: null },
    { actionType: 'Throw-In', quality: null },
    { actionType: 'Header', quality: 'Positive' },
    { actionType: 'Free Kick', quality: null },
    { actionType: 'Yellow Card', quality: 'Event' },
    { actionType: 'Sub In', quality: 'Event' },
  ]);

  assert.strictEqual(statsComprehensive.total, 6, 'Independent match events (Yellow Card, Sub In) do not add touches');
  assert.strictEqual(statsComprehensive['Yellow Card'], 1, 'Yellow card recorded');
  assert.strictEqual(statsComprehensive['Sub In'], 1, 'Sub in recorded');
  assert.strictEqual(statsComprehensive['Corner Kick'], 1, 'Corner kick recorded');
  assert.strictEqual(statsComprehensive['Throw-In'], 1, 'Throw-in recorded');
  assert.strictEqual(statsComprehensive.Pass, 1, 'Pass recorded');
  assert.strictEqual(statsComprehensive.Dribble, 1, 'Dribble recorded');
  console.log('✓ Test 5 passed: Existing session data and unrelated counters are preserved.');
}

console.log('ALL 5 TESTS PASSED SUCCESSFULLY!');
