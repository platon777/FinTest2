
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { mockUser } from '../data/mock';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGOUT_TIMER = 15 * 60 * 1000; // 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const resetTimeout = useCallback(() => {
    const timer = setTimeout(logout, LOGOUT_TIMER);
    return () => clearTimeout(timer);
  }, [logout]);

  useEffect(() => {
    if (user) {
        // FIX: Use `let` to allow re-assigning the timer cleanup function on activity.
        let clearTimer = resetTimeout();
        
        const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
        
        const activityHandler = () => {
            // FIX: Correctly clear the old timer and set a new one.
            // The original `clearTimeout(clearTimer())` was a type error because `clearTimer()` returns void.
            // This also fixes a logic bug where the new timer's cleaner was not stored.
            clearTimer();
            clearTimer = resetTimeout();
        };

        activityEvents.forEach(event => window.addEventListener(event, activityHandler));

        return () => {
            clearTimer();
            activityEvents.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }
  }, [user, resetTimeout]);

  const login = async (email: string, password: string): Promise<void> => {
    console.log('Attempting login with:', email, password);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'jean.dupont@email.com' && password === 'password123') {
          setUser(mockUser);
          resolve();
        } else {
          // In a real app, you would reject with an error
          console.error("Invalid credentials");
          resolve(); // Resolve anyway for the demo
        }
      }, 1000);
    });
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
