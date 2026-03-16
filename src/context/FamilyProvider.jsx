import React, { useEffect, useState } from 'react';
import { familyService } from '../services/familyService';
import { onAuthChange } from '../services/authService';
import { logger } from '../utils/logger';
import { FamilyContext } from './FamilyContext';

export const FamilyProvider = ({ children }) => {
  const [family, setFamily] = useState(null);
  const [publicFamilies, setPublicFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshFamily = async () => {
    setLoading(true);
    try {
      const data = await familyService.getMyFamily();
      setFamily(data);
      setError(null);
    } catch (err) {
      logger.error('[FamilyContext] Fetch error:', err);
      setError(err.message);
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
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        await Promise.all([refreshFamily(), refreshPublicFamilies()]);
      } else {
        setFamily(null);
        setPublicFamilies([]);
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

  return (
    <FamilyContext.Provider
      value={{
        family,
        publicFamilies,
        loading,
        error,
        refreshFamily,
        refreshPublicFamilies,
        createFamily,
        joinFamily
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export default FamilyProvider;
