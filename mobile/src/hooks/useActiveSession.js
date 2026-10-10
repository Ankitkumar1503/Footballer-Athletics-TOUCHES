import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from './useLiveQuery';
import { db } from '../lib/db';

/**
 * Custom hook to manage the active session
 * Automatically creates a new session if none exists
 * Subscribes to database changes using useLiveQuery
 */
export function useActiveSession() {
  const [sessionId, setSessionId] = useState(null);

  // Get or create active session
  useEffect(() => {
    async function initializeSession() {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const existingSession = await db.sessions
          .where('date')
          .equals(today)
          .first();

        if (existingSession) {
          setSessionId(existingSession.id);
        } else {
          // Create a new session for today
          // Copy profile data from last session if one exists
          const lastSession = await db.sessions.orderBy('createdAt').last();

          const newSessionId = await db.sessions.add({
            date: today,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            playerName: lastSession?.playerName || '',
            position: lastSession?.position || '',
            club: lastSession?.club || '',
            team: lastSession?.team || '',
            age: lastSession?.age || '',
            level: lastSession?.level || '',
            gameNumber: null,
            totalYearsPlaying: lastSession?.totalYearsPlaying || '',
            totalHoursTrained: lastSession?.totalHoursTrained || '',
            activeFooter: lastSession?.activeFooter || 'RIGHT',
            createdAt: Date.now(),
          });
          setSessionId(newSessionId);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    }

    initializeSession();
  }, []);

  // Subscribe to session changes
  const session = useLiveQuery(
    async () => {
      if (!sessionId) return undefined;
      return await db.sessions.get(sessionId);
    },
    [sessionId]
  );

  // Subscribe to touches for this session
  const touches = useLiveQuery(
    async () => {
      if (!sessionId) return [];
      return await db.touches.where('sessionId').equals(sessionId).toArray();
    },
    [sessionId]
  );

  // Subscribe to reflection for this session
  const reflection = useLiveQuery(
    async () => {
      if (!sessionId) return null;
      return await db.reflections.where('sessionId').equals(sessionId).first();
    },
    [sessionId]
  );

  // Calculate stats from touches
  const stats = useMemo(() => {
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
  }, [touches]);

  // Update session function
  const updateSession = useCallback(
    async (updates) => {
      if (!sessionId) return;
      try {
        await db.sessions.update(sessionId, updates);
      } catch (error) {
        console.error('Error updating session:', error);
      }
    },
    [sessionId]
  );

  // Add touch function
  const addTouch = useCallback(
    async (actionType, quality) => {
      if (!sessionId) return;
      try {
        await db.touches.add({
          sessionId,
          actionType,
          quality,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error adding touch:', error);
      }
    },
    [sessionId]
  );

  // Remove specific touch function
  const removeTouch = useCallback(
    async (actionType) => {
      if (!sessionId) return;
      try {
        const allTouches = await db.touches.where('sessionId').equals(sessionId).toArray();
        if (allTouches.length > 0) {
          allTouches.sort((a, b) => b.timestamp - a.timestamp);
          const target = actionType
            ? allTouches.find(
                (t) =>
                  t.actionType === actionType ||
                  (actionType === 'Penalty' && t.actionType === 'Penalty Kick')
              )
            : allTouches[0];
          if (target) {
            await db.touches.delete(target.id);
          }
        }
      } catch (error) {
        console.error('Error removing touch:', error);
      }
    },
    [sessionId]
  );

  // Undo last touch function
  const undoLastTouch = useCallback(async () => {
    if (!sessionId) return;
    try {
      const allTouches = await db.touches.where('sessionId').equals(sessionId).toArray();
      if (allTouches.length > 0) {
        allTouches.sort((a, b) => b.timestamp - a.timestamp);
        await db.touches.delete(allTouches[0].id);
      }
    } catch (error) {
      console.error('Error undoing last touch:', error);
    }
  }, [sessionId]);

  // Update reflection function
  const updateReflection = useCallback(
    async (updates) => {
      if (!sessionId) return;
      try {
        const existing = await db.reflections.where('sessionId').equals(sessionId).first();

        if (existing) {
          await db.reflections.update(existing.id, updates);
        } else {
          await db.reflections.add({
            sessionId,
            ...updates,
          });
        }
      } catch (error) {
        console.error('Error updating reflection:', error);
      }
    },
    [sessionId]
  );

  return {
    sessionId,
    session: session || {},
    touches: touches || [],
    reflection: reflection || {},
    stats: stats || { total: 0, good: 0, bad: 0 },
    updateSession,
    addTouch,
    removeTouch,
    undoLastTouch,
    updateReflection,
  };
}

export default useActiveSession;
