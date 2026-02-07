import { createContext, useContext } from 'react';

const FamilyContext = createContext(null);

export const useFamily = () => useContext(FamilyContext);

export { FamilyContext };
export default FamilyContext;
