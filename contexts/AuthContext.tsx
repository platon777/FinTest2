import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, SwitchableAccount, Portfolio, Subscription, Transaction, ClientAccount, Instrument } from '../types';
import * as apiService from '../services/apiService';
import { mockDatabase } from '../data/mock';

interface AuthContextType {
  loggedInUser: User | null;
  displayedUser: User | null;
  portfolio: Portfolio | null;
  subscriptions: Subscription[];
  transactions: Transaction[];
  accounts: ClientAccount[];
  instruments: Instrument[];
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const logout = useCallback(() => {
    setLoggedInUser(null);
    setDisplayedUser(null);
    setActiveAccount(null);
    setPortfolio(null);
    setSubscriptions([]);
    setTransactions([]);
    setAccounts([]);
    setInstruments([]);
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
                const [userData, portfolioData, subscriptionsData, transactionsData, accountsData, instrumentsData] = await Promise.all([
                    apiService.getUserData(activeAccount.id),
                    apiService.getPortfolio(activeAccount.id),
                    apiService.getSubscriptions(activeAccount.id),
                    apiService.getTransactions(activeAccount.id),
                    apiService.getAccounts(activeAccount.id),
                    apiService.getInstruments(activeAccount.id)
                ]);
                setDisplayedUser(userData);
                setPortfolio(portfolioData);
                setSubscriptions(subscriptionsData);
                setTransactions(transactionsData);
                setAccounts(accountsData);
                setInstruments(instrumentsData);
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
    subscriptions,
    transactions,
    accounts,
    instruments,
    isLoadingData,
    login, 
    logout, 
    activeAccount, 
    availableAccounts, 
    switchAccount 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
