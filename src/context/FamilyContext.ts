import { createContext, useContext, Context } from 'react';

interface FamilyContextValue {
  family: unknown;
  weeklyGoal: unknown;
}

const FamilyContext: Context<FamilyContextValue | null> = createContext<FamilyContextValue | null>(null);

export const useFamily = (): FamilyContextValue => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export { FamilyContext };
export default FamilyContext;
