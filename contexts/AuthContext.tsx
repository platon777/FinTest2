import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, SwitchableAccount, Portfolio, Bond, Transaction } from '../types';
import * as apiService from '../services/apiService';
import { mockDatabase } from '../data/mock';

interface AuthContextType {
  loggedInUser: User | null; // The user who is logged in
  displayedUser: User | null; // The user profile being displayed (can be an associated account)
  portfolio: Portfolio | null;
  bonds: Bond[];
  transactions: Transaction[];
  isLoadingData: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  activeAccount: SwitchableAccount | null;
  availableAccounts: SwitchableAccount[];
  switchAccount: (accountId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGOUT_TIMER = 15 * 60 * 1000; // 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [displayedUser, setDisplayedUser] = useState<User | null>(null);
  const [activeAccount, setActiveAccount] = useState<SwitchableAccount | null>(null);
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const logout = useCallback(() => {
    setLoggedInUser(null);
    setDisplayedUser(null);
    setActiveAccount(null);
    setPortfolio(null);
    setBonds([]);
    setTransactions([]);
  }, []);
  
  const resetTimeout = useCallback(() => {
    const timer = setTimeout(logout, LOGOUT_TIMER);
    return () => clearTimeout(timer);
  }, [logout]);
  
  useEffect(() => {
    if (loggedInUser) {
        let clearTimer = resetTimeout();
        const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
        const activityHandler = () => {
            clearTimer();
            clearTimer = resetTimeout();
        };
        activityEvents.forEach(event => window.addEventListener(event, activityHandler));
        return () => {
            clearTimer();
            activityEvents.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }
  }, [loggedInUser, resetTimeout]);

  // Fetch data when active account changes
  useEffect(() => {
    if (activeAccount) {
        const fetchDataForAccount = async () => {
            setIsLoadingData(true);
            try {
                const [userData, portfolioData, bondsData, transactionsData] = await Promise.all([
                    apiService.getUserData(activeAccount.id),
                    apiService.getPortfolio(activeAccount.id),
                    apiService.getBonds(activeAccount.id),
                    apiService.getTransactions(activeAccount.id)
                ]);
                setDisplayedUser(userData);
                setPortfolio(portfolioData);
                setBonds(bondsData);
                setTransactions(transactionsData);
            } catch (error) {
                console.error("Failed to fetch account data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchDataForAccount();
    }
  }, [activeAccount]);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call for login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'jean.dupont@email.com' && password === 'password123') {
          const mainUserData = mockDatabase['user-1'].user;
          setLoggedInUser(mainUserData);
          // Set the primary user as the initial active account
          setActiveAccount({
              id: mainUserData.id,
              name: mainUserData.name,
              type: 'Personnel',
          });
          resolve();
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  };

  const switchAccount = (accountId: string) => {
    if (!loggedInUser) return;
    const allAccounts = [
        { id: loggedInUser.id, name: loggedInUser.name, type: 'Personnel' as 'Personnel' | 'Entreprise' },
        ...(loggedInUser.associatedAccounts || [])
    ];
    const newAccount = allAccounts.find(acc => acc.id === accountId);
    if (newAccount) {
        setActiveAccount(newAccount);
    }
  };

  const availableAccounts = useMemo(() => (
    loggedInUser ? [
        { id: loggedInUser.id, name: loggedInUser.name, type: (loggedInUser.clientType === 'Individuel' ? 'Personnel' : 'Entreprise') as 'Personnel' | 'Entreprise' },
        ...(loggedInUser.associatedAccounts || [])
    ] : []
  ), [loggedInUser]);

  const value = { 
    loggedInUser,
    displayedUser,
    portfolio,
    bonds,
    transactions,
    isLoadingData,
    login, 
    logout, 
    activeAccount, 
    availableAccounts, 
    switchAccount 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
