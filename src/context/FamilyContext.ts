import { createContext, useContext, Context } from 'react';

type FamilyContextValue = {
  family: { id?: string; name?: string; membersDetails?: unknown[] } | null;
  weeklyGoal: { title?: string; currentValue?: number; targetValue?: number } | null;
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
