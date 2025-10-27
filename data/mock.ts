import { UserData, TransactionType, TransactionStatus, BondStatus } from '../types';

const jeanDupontData: UserData = {
  user: {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    clientType: 'Individuel',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la République, 75001 Paris, France',
    investorProfile: {
      type: 'Personne physique',
      riskLevel: 'Modéré',
      investmentHorizon: 'Moyen terme',
      annualIncome: '50k-75k USD',
    },
    associatedAccounts: [
      { id: 'acct-2', name: 'Innovatech SARL', type: 'Entreprise' },
      { id: 'acct-3', name: 'Marie Dupont', type: 'Personnel' },
    ],
  },
  portfolio: {
    totalValue: 50000,
    totalReturnPercentage: 5.2,
    totalReturnAmount: 2600,
    activeBondsCount: 3,
    evolution: [
      { month: 'Jan', value: 48000 },
      { month: 'Fév', value: 48500 },
      { month: 'Mar', value: 49200 },
      { month: 'Avr', value: 49800 },
      { month: 'Mai', value: 50100 },
      { month: 'Juin', value: 50000 },
    ],
  },
  bonds: [
    { id: 'bond-1', name: 'Obligation BRH 2025', investedAmount: 20000, yieldRate: 4.5, subscriptionDate: '2023-06-15', maturityDate: '2025-06-15', expectedReturn: 20900, status: BondStatus.ACTIVE },
    { id: 'bond-2', name: 'Obligation Gouvernementale Haiti 2026', investedAmount: 15000, yieldRate: 3.8, subscriptionDate: '2023-12-20', maturityDate: '2026-12-20', expectedReturn: 16710, status: BondStatus.ACTIVE },
    { id: 'bond-3', name: 'Obligation Corporate X 2024', investedAmount: 15000, yieldRate: 5.5, subscriptionDate: '2022-11-30', maturityDate: '2024-11-30', expectedReturn: 16650, status: BondStatus.ACTIVE },
    { id: 'bond-4', name: 'Obligation Verte Energie 2023', investedAmount: 10000, yieldRate: 4.0, subscriptionDate: '2021-01-10', maturityDate: '2023-01-10', expectedReturn: 10800, status: BondStatus.MATURED }
  ],
  transactions: [
    { id: 'tx-1', date: '2024-07-20', type: TransactionType.DEPOSIT, description: 'Virement entrant', amount: 5000, status: TransactionStatus.VALIDATED },
    { id: 'tx-2', date: '2024-07-18', type: TransactionType.INVESTMENT, description: 'Achat Obligation BRH 2025', amount: -20000, status: TransactionStatus.VALIDATED },
    { id: 'tx-3', date: '2024-07-15', type: TransactionType.WITHDRAWAL, description: 'Retrait en ligne', amount: -1000, status: TransactionStatus.VALIDATED },
  ],
};

const innovatechData: UserData = {
  user: {
    id: 'acct-2',
    name: 'Innovatech SARL',
    email: 'contact@innovatech.com',
    clientType: 'Institutionnel',
    phone: '+33 1 98 76 54 32',
    address: '456 Avenue des Champs-Élysées, 75008 Paris, France',
    investorProfile: {
      type: 'Personne morale',
      riskLevel: 'Élevé',
      investmentHorizon: 'Long terme',
    },
  },
  portfolio: {
    totalValue: 750000,
    totalReturnPercentage: 8.1,
    totalReturnAmount: 60750,
    activeBondsCount: 5,
    evolution: [
      { month: 'Jan', value: 720000 }, { month: 'Fév', value: 735000 }, { month: 'Mar', value: 742000 },
      { month: 'Avr', value: 748000 }, { month: 'Mai', value: 755000 }, { month: 'Juin', value: 750000 },
    ],
  },
  bonds: [
    { id: 'b-corp-1', name: 'Obligation Tech Growth 2030', investedAmount: 250000, yieldRate: 7.2, subscriptionDate: '2022-01-20', maturityDate: '2030-01-20', expectedReturn: 430000, status: BondStatus.ACTIVE },
    { id: 'b-corp-2', name: 'Obligation Infrastructure 2028', investedAmount: 300000, yieldRate: 6.5, subscriptionDate: '2023-05-10', maturityDate: '2028-05-10', expectedReturn: 397500, status: BondStatus.ACTIVE },
    { id: 'b-corp-3', name: 'Obligation État Français 2027', investedAmount: 200000, yieldRate: 3.1, subscriptionDate: '2023-09-01', maturityDate: '2027-09-01', expectedReturn: 224800, status: BondStatus.ACTIVE },
  ],
  transactions: [
    { id: 'tx-corp-1', date: '2024-07-22', type: TransactionType.DEPOSIT, description: 'Apport en capital', amount: 100000, status: TransactionStatus.VALIDATED },
    { id: 'tx-corp-2', date: '2024-07-15', type: TransactionType.INVESTMENT, description: 'Achat Obligation Tech Growth', amount: -250000, status: TransactionStatus.VALIDATED },
    { id: 'tx-corp-3', date: '2024-07-01', type: TransactionType.WITHDRAWAL, description: 'Paiement fournisseurs', amount: -50000, status: TransactionStatus.VALIDATED },
  ],
};

const marieDupontData: UserData = {
  user: {
    id: 'acct-3',
    name: 'Marie Dupont',
    email: 'marie.d@email.com',
    clientType: 'Individuel',
    phone: '+33 7 89 01 23 45',
    address: '123 Rue de la République, 75001 Paris, France',
    investorProfile: {
      type: 'Personne physique',
      riskLevel: 'Faible',
      investmentHorizon: 'Court terme',
      annualIncome: '30k-50k USD',
    },
  },
  portfolio: {
    totalValue: 15000,
    totalReturnPercentage: 2.5,
    totalReturnAmount: 375,
    activeBondsCount: 1,
    evolution: [
      { month: 'Jan', value: 14800 }, { month: 'Fév', value: 14850 }, { month: 'Mar', value: 14900 },
      { month: 'Avr', value: 14950 }, { month: 'Mai', value: 15050 }, { month: 'Juin', value: 15000 },
    ],
  },
  bonds: [
    { id: 'b-marie-1', name: 'Obligation Épargne Sûre 2025', investedAmount: 15000, yieldRate: 2.5, subscriptionDate: '2023-01-15', maturityDate: '2025-01-15', expectedReturn: 15750, status: BondStatus.ACTIVE },
    { id: 'b-marie-2', name: 'Ancienne Obligation', investedAmount: 5000, yieldRate: 2.0, subscriptionDate: '2021-06-01', maturityDate: '2023-06-01', expectedReturn: 5200, status: BondStatus.MATURED }
  ],
  transactions: [
    { id: 'tx-marie-1', date: '2024-05-10', type: TransactionType.DEPOSIT, description: 'Virement Épargne', amount: 1000, status: TransactionStatus.VALIDATED },
    { id: 'tx-marie-2', date: '2024-04-02', type: TransactionType.WITHDRAWAL, description: 'Retrait', amount: -500, status: TransactionStatus.VALIDATED },
  ],
};


export const mockDatabase: Record<string, UserData> = {
    'user-1': jeanDupontData,
    'acct-2': innovatechData,
    'acct-3': marieDupontData
};
