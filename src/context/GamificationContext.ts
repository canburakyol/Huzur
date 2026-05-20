import { createContext, Context } from 'react';

export interface GamificationContextValue {
  points?: number;
  level?: number;
  streak?: number;
  badges?: string[];
}

export const GamificationContext: Context<GamificationContextValue | undefined> = createContext<GamificationContextValue | undefined>(undefined);
