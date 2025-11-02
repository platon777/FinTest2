import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  AuthUser,
  SwitchableAccount,
  Portfolio,
  Subscription,
  Transaction,
  ClientAccount,
  Instrument,
  DashboardOverview,
} from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { dashboardService } from '../services/dashboardService';
import { souscriptionsService } from '../services/souscriptionsService';
import { transactionsService } from '../services/transactionsService';
import { comptesService } from '../services/comptesService';
import { instrumentsService } from '../services/instrumentsService';

interface AuthContextType {
  loggedInUser: User | null;
  authUser: AuthUser | null;
  displayedUser: User | null;
  portfolio: Portfolio | null;
  dashboardOverview: DashboardOverview | null;
  subscriptions: Subscription[];
  transactions: Transaction[];
  accounts: ClientAccount[];
  instruments: Instrument[];
  isLoadingData: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activeAccount: SwitchableAccount | null;
  availableAccounts: SwitchableAccount[];
  switchAccount: (accountId: string) => void;
  refreshData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGOUT_TIMER = 15 * 60 * 1000; // 15 minutes

// Helper functions outside component
const convertAuthUserToUser = (authUser: AuthUser, accounts: ClientAccount[]): User => {
  const fullName = authUser.client_type === 'INDIVIDUEL'
    ? `${authUser.prenom || ''} ${authUser.nom || ''}`.trim()
    : authUser.nom_entreprise || '';

  return {
    id: authUser.client_id.toString(),
    name: fullName,
    email: authUser.email,
    clientType: authUser.client_type === 'INDIVIDUEL' ? 'Individuel' : 'Institutionnel',
    phone: '',
    address: '',
    investorProfile: {
      type: authUser.client_type === 'INDIVIDUEL' ? 'Personne physique' : 'Personne morale',
      riskLevel: 'Modéré',
      investmentHorizon: 'Moyen terme',
    },
    associatedAccounts: accounts.map((acc) => ({
      id: acc.accountId.toString(),
      name: acc.accountNumber,
      type: authUser.client_type === 'INDIVIDUEL' ? 'Personnel' : 'Entreprise',
    })),
  };
};

const convertSubscription = (sub: any): Subscription => ({
  subscriptionId: sub.SouscriptionID,
  accountId: sub.CompteID,
  instrumentId: sub.InstrumentID,
  investedAmount: sub.MontantInvesti,
  units: sub.NombreUnites,
  subscriptionDate: sub.DateSouscription,
  effectiveMaturityDate: sub.DateMaturiteEffective,
  rateOnSubscription: sub.TauxSouscription,
  currentValue: sub.ValeurActuelle,
  accumulatedInterest: sub.InteretsAccumules,
  status: sub.StatutSouscription,
});

const convertTransaction = (tx: any): Transaction => ({
  transactionId: tx.TransactionID,
  transactionType: tx.TypeTransaction,
  sourceAccountId: tx.CompteSource || null,
  destinationAccountId: tx.CompteDestination || null,
  amount: tx.Montant,
  currency: tx.Devise,
  description: tx.Description || '',
  status: tx.StatutTransaction,
  createdBy: 0,
  creationDate: tx.DateCreation,
  validatedBy: null,
  validationDate: null,
  executionDate: tx.DateExecution || null,
  makerComments: null,
  checkerComments: null,
  isAutomatic: tx.EstAutomatique || false,
  subscriptionId: tx.SouscriptionID || null,
});

const convertAccount = (acc: any): ClientAccount => ({
  accountId: acc.CompteID,
  accountNumber: acc.NumeroCompte,
  accountType: acc.TypeCompte,
  currency: acc.Devise,
  balance: acc.Solde,
  availableBalance: acc.SoldeDisponible,
  openingDate: acc.DateOuverture,
  closingDate: acc.DateFermeture || null,
  status: acc.StatutCompte,
});

const convertInstrument = (inst: any): Instrument => ({
  instrumentId: inst.InstrumentID,
  instrumentType: 'OBLIGATION',
  code: inst.Code,
  name: inst.Nom,
  description: inst.Description || '',
  issuer: inst.Emetteur,
  annualYieldRate: inst.TauxRendementAnnuel,
  issueDate: inst.DateEmission,
  maturityDate: inst.DateMaturite,
  nominalValue: inst.ValeurNominale,
  minInvestment: inst.MontantMinimum,
  currency: inst.Devise,
  interestPaymentFrequency: inst.FrequencePaiementInterets,
  status: inst.StatutInstrument,
});

const convertDashboardToPortfolio = (
  overview: any,
  monthlyStats: any[]
): Portfolio => ({
  totalValue: parseFloat(overview.valeur_totale || overview.valeurTotale || 0),
  totalReturnPercentage: parseFloat(overview.pourcentage_rendement || overview.pourcentageRendement || 0),
  totalReturnAmount: parseFloat(overview.rendement_total || overview.rendementTotal || 0),
  activeSubscriptionsCount: parseInt(overview.nombre_souscriptions_actives || overview.nombreSouscriptionsActives || 0, 10),
  evolution: monthlyStats.map((stat) => ({
    month: stat.mois,
    value: parseFloat(stat.valeur_portefeuille || stat.valeurPortefeuille || 0),
  })),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [displayedUser, setDisplayedUser] = useState<User | null>(null);
  const [activeAccount, setActiveAccount] = useState<SwitchableAccount | null>(null);

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<ClientAccount[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggedInUser(null);
      setAuthUser(null);
      setDisplayedUser(null);
      setActiveAccount(null);
      setPortfolio(null);
      setDashboardOverview(null);
      setSubscriptions([]);
      setTransactions([]);
      setAccounts([]);
      setInstruments([]);
      setError(null);
    }
  }, []);

  const resetTimeout = useCallback(() => {
    const timer = setTimeout(logout, LOGOUT_TIMER);
    return () => clearTimeout(timer);
  }, [logout]);

  useEffect(() => {
    if (authUser) {
      let clearTimer = resetTimeout();
      const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
      const activityHandler = () => {
        clearTimer();
        clearTimer = resetTimeout();
      };
      activityEvents.forEach((event) => window.addEventListener(event, activityHandler));
      return () => {
        clearTimer();
        activityEvents.forEach((event) => window.removeEventListener(event, activityHandler));
      };
    }
  }, [authUser, resetTimeout]);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoadingData(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success) {
        setAuthUser(response.client);

        // Load user data
        const currentUser = await userService.getCurrentUser();

        // Load accounts
        const accountsData = await comptesService.getMesComptes('ACTIF');
        const convertedAccounts = accountsData.map(convertAccount);
        setAccounts(convertedAccounts);

        // Convert auth user to User format
        const user = convertAuthUserToUser(
          {
            client_id: currentUser.client_id,
            email: currentUser.email,
            client_type: currentUser.client_type,
            prenom: currentUser.prenom,
            nom: currentUser.nom,
          },
          convertedAccounts
        );
        setLoggedInUser(user);
        setDisplayedUser(user);

        // Set the first account as active
        if (convertedAccounts.length > 0) {
          const firstAccount = convertedAccounts[0];
          setActiveAccount({
            id: firstAccount.accountId.toString(),
            name: firstAccount.accountNumber,
            type: currentUser.client_type === 'INDIVIDUEL' ? 'Personnel' : 'Entreprise',
          });

          // Load data for the first account
          const [overview, subs, txs, insts, monthlyStats] = await Promise.all([
            dashboardService.getOverview(firstAccount.accountId),
            souscriptionsService.getMesSouscriptions(),
            transactionsService.getMesTransactions(100),
            instrumentsService.getInstrumentsDisponibles(),
            dashboardService.getMonthlyStatistics(firstAccount.accountId, 12),
          ]);

          setDashboardOverview(overview);
          setPortfolio(convertDashboardToPortfolio(overview, monthlyStats));
          setSubscriptions(subs.map(convertSubscription));
          setTransactions(txs.map(convertTransaction));
          setInstruments(insts.map(convertInstrument));
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoadingData(false);
    }
  };

  const switchAccount = (accountId: string) => {
    if (!loggedInUser) return;
    const allAccounts = [
      {
        id: loggedInUser.id,
        name: loggedInUser.name,
        type: 'Personnel' as 'Personnel' | 'Entreprise',
      },
      ...(loggedInUser.associatedAccounts || []),
    ];
    const newAccount = allAccounts.find((acc) => acc.id === accountId);
    if (newAccount) {
      setActiveAccount(newAccount);
    }
  };

  const refreshData = async () => {
    if (!activeAccount) return;

    setIsLoadingData(true);
    setError(null);

    try {
      const accountId = parseInt(activeAccount.id, 10);
      console.log('🔄 Refreshing data for account ID:', accountId);

      const [overview, subs, txs, insts, monthlyStats] = await Promise.all([
        dashboardService.getOverview(accountId),
        souscriptionsService.getMesSouscriptions(),
        transactionsService.getMesTransactions(100),
        instrumentsService.getInstrumentsDisponibles(),
        dashboardService.getMonthlyStatistics(accountId, 12),
      ]);

      console.log('✅ Overview received:', overview);
      console.log('📊 Monthly Stats received:', monthlyStats);

      // Null checks before using the data
      if (overview) {
        const portfolio = convertDashboardToPortfolio(overview, monthlyStats || []);
        console.log('📊 Converted Portfolio:', portfolio);
        setDashboardOverview(overview);
        setPortfolio(portfolio);
      } else {
        console.warn('⚠️ Overview is null or undefined');
      }

      if (subs && Array.isArray(subs)) {
        setSubscriptions(subs.map(convertSubscription));
      }

      if (txs && Array.isArray(txs)) {
        setTransactions(txs.map(convertTransaction));
      }

      if (insts && Array.isArray(insts)) {
        setInstruments(insts.map(convertInstrument));
      }
    } catch (error: any) {
      console.error('Failed to refresh data:', error);
      setError(error.message || 'Failed to refresh data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load data when active account changes
  useEffect(() => {
    if (activeAccount && authUser) {
      refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.id, authUser?.client_id]);

  const availableAccounts = useMemo(
    () =>
      loggedInUser
        ? [
            {
              id: loggedInUser.id,
              name: loggedInUser.name,
              type:
                loggedInUser.clientType === 'Individuel'
                  ? ('Personnel' as 'Personnel' | 'Entreprise')
                  : ('Entreprise' as 'Personnel' | 'Entreprise'),
            },
            ...(loggedInUser.associatedAccounts || []),
          ]
        : [],
    [loggedInUser]
  );

  const value = {
    loggedInUser,
    authUser,
    displayedUser,
    portfolio,
    dashboardOverview,
    subscriptions,
    transactions,
    accounts,
    instruments,
    isLoadingData,
    error,
    login,
    logout,
    activeAccount,
    availableAccounts,
    switchAccount,
    refreshData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
