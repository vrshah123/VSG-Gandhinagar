import { createContext, useContext, useState } from 'react';
import { HARDCODED_SESSION } from '../config/sheets';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Phase 1: admin hardcoded
  const [session] = useState(HARDCODED_SESSION);

  return (
    <AuthContext.Provider value={{ session, role: session.role, fullName: session.fullName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
