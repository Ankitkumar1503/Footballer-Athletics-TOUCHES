import { useState, useEffect, useCallback } from 'react';
import { db, subscribeToDb } from '../lib/db';

/**
 * Hook that computes cumulative player stats across ALL sessions.
 * These stats accumulate every time the player uses the app.
 * Uses the mobile AsyncStorage-based DB adapter.
 */
export function useCumulativeStats() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalHoursTrained: 0,
    totalGames: 0,
    totalGoals: 0,
    totalPenalties: 0,
    totalTouches: 0,
    todayTouches: 0,
    weekTouches: 0,
    monthTouches: 0,
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
  });

  const computeStats = useCallback(async () => {
    try {
      const allSessions = await db.sessions.getAll();
      const allTouches = await db.touches.getAll();

      // Count sessions
      const totalSessions = allSessions.length;

      // Sum per-session fields
      const sessionAggregates = allSessions.reduce(
        (acc, session) => {
          const hours = session.totalHoursTrained !== undefined && session.totalHoursTrained !== '' && session.totalHoursTrained !== null
            ? parseFloat(session.totalHoursTrained) || 0
            : (parseFloat(session.timeInTraining) || 0) / 60;
          acc.totalHoursTrained += hours;
          acc.totalGames += parseFloat(session.totalGames) || 0;
          return acc;
        },
        { totalHoursTrained: 0, totalGames: 0 }
      );

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

      let todayTouches = 0;
      let weekTouches = 0;
      let monthTouches = 0;
      let totalTouches = 0;
      let totalGoals = 0;
      let totalPenalties = 0;
      let totalCornerKicks = 0;
      let totalThrowIns = 0;
      let shotsOnTarget = 0;
      let tacklesMade = 0;
      let headers = 0;
      let freeKicks = 0;
      let yellowCards = 0;
      let redCards = 0;
      let subIn = 0;
      let subOut = 0;
      let injured = 0;
      let missedGames = 0;
      let keepUpFeet = 0;
      let keepUpHead = 0;
      let passes = 0;
      let dribbles = 0;
      let positiveCount = 0;
      let negativeCount = 0;

      allTouches.forEach((touch) => {
        const ts = touch.timestamp || 0;
        const isIndependent = INDEPENDENT_EVENTS.includes(touch.actionType) || touch.quality === 'Event';

        if (!isIndependent) {
          totalTouches++;
          if (ts >= oneDayAgo) todayTouches++;
          if (ts >= oneWeekAgo) weekTouches++;
          if (ts >= oneMonthAgo) monthTouches++;

          if (touch.quality === 'Positive') positiveCount++;
          if (touch.quality === 'Negative') negativeCount++;
        }

        const action = touch.actionType;
        if (action === 'Goal') totalGoals++;
        else if (action === 'Penalty' || action === 'Penalty Kick') totalPenalties++;
        else if (action === 'Corner Kick' || action === 'Corners') totalCornerKicks++;
        else if (action === 'Throw-In' || action === 'Throw-in') totalThrowIns++;
        else if (action === 'Shot') shotsOnTarget++;
        else if (action === 'Tackle') tacklesMade++;
        else if (action === 'Header') headers++;
        else if (action === 'Free Kick') freeKicks++;
        else if (action === 'Yellow Card') yellowCards++;
        else if (action === 'Red Card') redCards++;
        else if (action === 'Sub In') subIn++;
        else if (action === 'Sub Out') subOut++;
        else if (action === 'Injury' || action === 'Injured') injured++;
        else if (action === 'Missed Game') missedGames++;
        else if (action === 'Keep-Up-Feet') keepUpFeet++;
        else if (action === 'Keep-Up-Head') keepUpHead++;
        else if (action === 'Pass') passes++;
        else if (action === 'Dribble') dribbles++;
      });

      setStats({
        totalSessions,
        totalHoursTrained: Math.round(sessionAggregates.totalHoursTrained * 10) / 10,
        totalGames: sessionAggregates.totalGames,
        totalGoals,
        totalPenalties,
        totalTouches,
        todayTouches,
        weekTouches,
        monthTouches,
        totalCornerKicks,
        totalThrowIns,
        shots: shotsOnTarget,
        shotsOnTarget,
        tacklesMade,
        headers,
        freeKicks,
        yellowCards,
        redCards,
        subIn,
        subOut,
        injured,
        missedGames,
        keepUpFeet,
        keepUpHead,
        passes,
        dribbles,
        positiveCount,
        negativeCount,
      });
    } catch (error) {
      console.error('Error computing cumulative stats:', error);
    }
  }, []);

  useEffect(() => {
    computeStats();
    // Subscribe to DB changes for reactivity
    const unsubscribe = subscribeToDb(computeStats);
    return unsubscribe;
  }, [computeStats]);

  return stats;
}

export default useCumulativeStats;
