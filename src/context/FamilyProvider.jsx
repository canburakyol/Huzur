import React, { useEffect, useState, useMemo } from 'react';
import { familyService } from '../services/familyService';
import { onAuthChange } from '../services/authService';
import { logger } from '../utils/logger';
import { FamilyContext } from './FamilyContext';

export const FamilyProvider = ({ children }) => {
  const [family, setFamily] = useState(null);
  const [publicFamilies, setPublicFamilies] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [weeklyGoalLoading, setWeeklyGoalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFamily = async () => {
    setLoading(true);
    try {
      const data = await familyService.getMyFamily();
      setFamily(data);
      if (data?.id) {
        setWeeklyGoalLoading(true);
        try {
          const goal = await familyService.getWeeklyGoal(data.id);
          setWeeklyGoal(goal);
        } catch (goalError) {
          logger.error('[FamilyContext] Weekly goal fetch error:', goalError);
          setWeeklyGoal(null);
        } finally {
          setWeeklyGoalLoading(false);
        }
      } else {
        setWeeklyGoal(null);
      }
      setError(null);
    } catch (err) {
      logger.error('[FamilyContext] Fetch error:', err);
      setError(err.message);
      setWeeklyGoal(null);
      setWeeklyGoalLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshPublicFamilies = async () => {
    try {
      const families = await familyService.listPublicFamilies();
      setPublicFamilies(Array.isArray(families) ? families : []);
    } catch (err) {
      logger.error('[FamilyContext] Public families error:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // Defer Firestore calls — don't block main thread on mount
        const scheduleLoad = typeof requestIdleCallback === 'function'
          ? requestIdleCallback
          : (cb) => setTimeout(cb, 100);

        scheduleLoad(() => {
          void Promise.all([refreshFamily(), refreshPublicFamilies()]);
        }, { timeout: 3000 });
      } else {
        setFamily(null);
        setPublicFamilies([]);
        setWeeklyGoal(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const createFamily = async (name) => {
    try {
      await familyService.createFamily(name);
      await Promise.all([refreshFamily(), refreshPublicFamilies()]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const joinFamily = async (code) => {
    try {
      await familyService.joinFamily(code);
      await Promise.all([refreshFamily(), refreshPublicFamilies()]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const refreshWeeklyGoal = async () => {
    if (!family?.id) {
      setWeeklyGoal(null);
      return null;
    }

    setWeeklyGoalLoading(true);
    try {
      const goal = await familyService.getWeeklyGoal(family.id);
      setWeeklyGoal(goal);
      return goal;
    } catch (err) {
      logger.error('[FamilyContext] Refresh weekly goal error:', err);
      setError(err.message);
      return null;
    } finally {
      setWeeklyGoalLoading(false);
    }
  };

  const contributeWeeklyGoal = async (amount = 1, contributionType = 'manual_checkin') => {
    if (!family?.id) return null;

    setWeeklyGoalLoading(true);
    try {
      const goal = await familyService.contributeWeeklyGoal({
        familyId: family.id,
        amount,
        contributionType
      });
      setWeeklyGoal(goal);
      return goal;
    } catch (err) {
      logger.error('[FamilyContext] Contribute weekly goal error:', err);
      setError(err.message);
      return null;
    } finally {
      setWeeklyGoalLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    family,
    publicFamilies,
    weeklyGoal,
    weeklyGoalLoading,
    loading,
    error,
    refreshFamily,
    refreshPublicFamilies,
    refreshWeeklyGoal,
    contributeWeeklyGoal,
    createFamily,
    joinFamily
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [family, publicFamilies, weeklyGoal, weeklyGoalLoading, loading, error]);

  return (
    <FamilyContext.Provider value={contextValue}>
      {children}
    </FamilyContext.Provider>
  );
};

export default FamilyProvider;
