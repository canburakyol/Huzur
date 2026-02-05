import React, { createContext, useContext, useState, useEffect } from 'react';
import { familyService } from '../services/familyService';
import { onAuthChange } from '../services/authService';
import { logger } from '../utils/logger';

const FamilyContext = createContext(null);

export const useFamily = () => useContext(FamilyContext);

export const FamilyProvider = ({ children }) => {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aile verilerini yenileme fonksiyonu
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

  useEffect(() => {
    // Auth durumunu dinle
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // Kullanıcı giriş yaptıysa aile bilgisini çek
        await refreshFamily();
      } else {
        // Çıkış yaptıysa temizle
        setFamily(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const createFamily = async (name) => {
    try {
      await familyService.createFamily(name);
      await refreshFamily();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const joinFamily = async (code) => {
    try {
      await familyService.joinFamily(code);
      await refreshFamily();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return (
    <FamilyContext.Provider value={{
      family,
      loading,
      error,
      refreshFamily,
      createFamily,
      joinFamily
    }}>
      {children}
    </FamilyContext.Provider>
  );
};
