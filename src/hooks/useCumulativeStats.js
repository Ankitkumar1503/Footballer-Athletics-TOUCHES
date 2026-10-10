import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

/**
 * Hook that computes cumulative player stats across ALL sessions.
 * These stats accumulate every time the player uses the app.
 */
export function useCumulativeStats() {
  // Count all sessions
  const totalSessions = useLiveQuery(
    () => db.sessions.count(),
    []
  );

  // Get all sessions to sum up manual per-session fields
  const allSessions = useLiveQuery(
    () => db.sessions.toArray(),
    []
  );

  // Get ALL touches across every session
  const allTouches = useLiveQuery(
    () => db.touches.toArray(),
    []
  );

  // Compute cumulative values from all sessions
  const sessionAggregates = (() => {
    if (!allSessions || allSessions.length === 0) {
      return { totalHoursTrained: 0, totalGames: 0 };
    }

    return allSessions.reduce((acc, session) => {
      // If totalHoursTrained is directly stored, use it; otherwise convert timeInTraining (minutes) to hours
      const hours = session.totalHoursTrained !== undefined && session.totalHoursTrained !== '' && session.totalHoursTrained !== null
        ? parseFloat(session.totalHoursTrained) || 0
        : (parseFloat(session.timeInTraining) || 0) / 60;
      acc.totalHoursTrained += hours;
      acc.totalGames += parseFloat(session.totalGames) || 0;
      return acc;
    }, { totalHoursTrained: 0, totalGames: 0 });
  })();

  // Compute cumulative touch-based stats and match events
  const touchAggregates = (() => {
    const initial = {
      totalTouches: 0,
      todayTouches: 0,
      weekTouches: 0,
      monthTouches: 0,
      totalGoals: 0,
      totalPenalties: 0,
      totalCornerKicks: 0,
      totalThrowIns: 0,
      shotsOnTarget: 0,
      tacklesMade: 0,
      headers: 0,
      freeKicks: 0,
      yellowCards: 0,
      redCards: 0,
      subIn: 0,
      subOut: 0,
      injured: 0,
      missedGames: 0,
      keepUpFeet: 0,
      keepUpHead: 0,
      passes: 0,
      dribbles: 0,
      positiveCount: 0,
      negativeCount: 0,
    };

    if (!allTouches || allTouches.length === 0) {
      return initial;
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const INDEPENDENT_EVENTS = [
      'Goal',
      'Yellow Card',
      'Red Card',
      'Missed Game',
      'Sub In',
      'Sub Out',
      'Injury',
      'Keep-Up-Feet',
      'Keep-Up-Head'
    ];

    return allTouches.reduce((acc, touch) => {
      const ts = touch.timestamp || 0;
      const isIndependent = INDEPENDENT_EVENTS.includes(touch.actionType) || touch.quality === 'Event';

      if (!isIndependent) {
        acc.totalTouches++;
        if (ts >= oneDayAgo) acc.todayTouches++;
        if (ts >= oneWeekAgo) acc.weekTouches++;
        if (ts >= oneMonthAgo) acc.monthTouches++;

        if (touch.quality === 'Positive') acc.positiveCount++;
        if (touch.quality === 'Negative') acc.negativeCount++;
      }

      const action = touch.actionType;
      if (action === 'Goal') acc.totalGoals++;
      else if (action === 'Penalty' || action === 'Penalty Kick') acc.totalPenalties++;
      else if (action === 'Corner Kick' || action === 'Corners') acc.totalCornerKicks++;
      else if (action === 'Throw-In' || action === 'Throw-in') acc.totalThrowIns++;
      else if (action === 'Shot') acc.shotsOnTarget++;
      else if (action === 'Tackle') acc.tacklesMade++;
      else if (action === 'Header') acc.headers++;
      else if (action === 'Free Kick') acc.freeKicks++;
      else if (action === 'Yellow Card') acc.yellowCards++;
      else if (action === 'Red Card') acc.redCards++;
      else if (action === 'Sub In') acc.subIn++;
      else if (action === 'Sub Out') acc.subOut++;
      else if (action === 'Injury' || action === 'Injured') acc.injured++;
      else if (action === 'Missed Game') acc.missedGames++;
      else if (action === 'Keep-Up-Feet') acc.keepUpFeet++;
      else if (action === 'Keep-Up-Head') acc.keepUpHead++;
      else if (action === 'Pass') acc.passes++;
      else if (action === 'Dribble') acc.dribbles++;

      return acc;
    }, initial);
  })();

  return {
    totalSessions: totalSessions ?? 0,
    totalHoursTrained: Math.round(sessionAggregates.totalHoursTrained * 10) / 10,
    totalGames: sessionAggregates.totalGames,
    totalGoals: touchAggregates.totalGoals,
    totalPenalties: touchAggregates.totalPenalties,
    totalTouches: touchAggregates.totalTouches,
    todayTouches: touchAggregates.todayTouches,
    weekTouches: touchAggregates.weekTouches,
    monthTouches: touchAggregates.monthTouches,
    totalCornerKicks: touchAggregates.totalCornerKicks,
    totalThrowIns: touchAggregates.totalThrowIns,
    shots: touchAggregates.shotsOnTarget,
    shotsOnTarget: touchAggregates.shotsOnTarget,
    tacklesMade: touchAggregates.tacklesMade,
    headers: touchAggregates.headers,
    freeKicks: touchAggregates.freeKicks,
    yellowCards: touchAggregates.yellowCards,
    redCards: touchAggregates.redCards,
    subIn: touchAggregates.subIn,
    subOut: touchAggregates.subOut,
    injured: touchAggregates.injured,
    missedGames: touchAggregates.missedGames,
    keepUpFeet: touchAggregates.keepUpFeet,
    keepUpHead: touchAggregates.keepUpHead,
    passes: touchAggregates.passes,
    dribbles: touchAggregates.dribbles,
    positiveCount: touchAggregates.positiveCount,
    negativeCount: touchAggregates.negativeCount,
  };
}
