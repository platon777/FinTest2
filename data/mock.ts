
import { User, Portfolio, Bond, Transaction, TransactionType, TransactionStatus, BondStatus } from '../types';

export const mockUser: User = {
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
};

export const mockPortfolio: Portfolio = {
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
};

export const mockBonds: Bond[] = [
  {
    id: 'bond-1',
    name: 'Obligation BRH 2025',
    investedAmount: 20000,
    yieldRate: 4.5,
    subscriptionDate: '2023-06-15',
    maturityDate: '2025-06-15',
    expectedReturn: 20900,
    status: BondStatus.ACTIVE,
  },
  {
    id: 'bond-2',
    name: 'Obligation Gouvernementale Haiti 2026',
    investedAmount: 15000,
    yieldRate: 3.8,
    subscriptionDate: '2023-12-20',
    maturityDate: '2026-12-20',
    expectedReturn: 16710,
    status: BondStatus.ACTIVE,
  },
  {
    id: 'bond-3',
    name: 'Obligation Corporate X 2024',
    investedAmount: 15000,
    yieldRate: 5.5,
    subscriptionDate: '2022-11-30',
    maturityDate: '2024-11-30',
    expectedReturn: 16650,
    status: BondStatus.ACTIVE,
  },
  {
    id: 'bond-4',
    name: 'Obligation Verte Energie 2023',
    investedAmount: 10000,
    yieldRate: 4.0,
    subscriptionDate: '2021-01-10',
    maturityDate: '2023-01-10',
    expectedReturn: 10800,
    status: BondStatus.MATURED,
  }
];

export const mockTransactions: Transaction[] = [
  { id: 'tx-1', date: '2024-07-20', type: TransactionType.DEPOSIT, description: 'Virement entrant', amount: 5000, status: TransactionStatus.VALIDATED },
  { id: 'tx-2', date: '2024-07-18', type: TransactionType.INVESTMENT, description: 'Achat Obligation BRH 2025', amount: -20000, status: TransactionStatus.VALIDATED },
  { id: 'tx-3', date: '2024-07-15', type: TransactionType.WITHDRAWAL, description: 'Retrait en ligne', amount: -1000, status: TransactionStatus.VALIDATED },
  { id: 'tx-4', date: '2024-07-10', type: TransactionType.INVESTMENT, description: 'Achat Obligation Gouv. Haiti 2026', amount: -15000, status: TransactionStatus.VALIDATED },
  { id: 'tx-5', date: '2024-07-05', type: TransactionType.DEPOSIT, description: 'Virement entrant', amount: 30000, status: TransactionStatus.VALIDATED },
  { id: 'tx-6', date: '2024-06-28', type: TransactionType.WITHDRAWAL, description: 'Retrait ATM', amount: -500, status: TransactionStatus.VALIDATED },
  { id: 'tx-7', date: '2024-06-20', type: TransactionType.INVESTMENT, description: 'Achat Obligation Corp. X 2024', amount: -15000, status: TransactionStatus.VALIDATED },
  { id: 'tx-8', date: '2024-06-15', type: TransactionType.DEPOSIT, description: 'Virement entrant', amount: 20000, status: TransactionStatus.VALIDATED },
  { id: 'tx-9', date: '2024-06-10', type: TransactionType.WITHDRAWAL, description: 'Virement sortant', amount: -2000, status: TransactionStatus.REJECTED },
  { id: 'tx-10', date: '2024-06-01', type: TransactionType.DEPOSIT, description: 'Dépôt initial', amount: 10000, status: TransactionStatus.VALIDATED },
];

