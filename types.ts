
export interface User {
  id: string;
  name: string;
  email: string;
  clientType: 'Individuel' | 'Institutionnel';
  phone: string;
  address: string;
  investorProfile: {
    type: 'Personne morale' | 'Personne physique';
    riskLevel: 'Faible' | 'Modéré' | 'Élevé';
    investmentHorizon: 'Court terme' | 'Moyen terme' | 'Long terme';
    annualIncome?: string;
  };
}

export interface Portfolio {
  totalValue: number;
  totalReturnPercentage: number;
  totalReturnAmount: number;
  activeBondsCount: number;
  evolution: { month: string; value: number }[];
}

export enum TransactionType {
  DEPOSIT = 'Dépôt',
  WITHDRAWAL = 'Retrait',
  INVESTMENT = 'Investissement',
}

export enum TransactionStatus {
  PENDING = 'En attente',
  VALIDATED = 'Validée',
  REJECTED = 'Rejetée',
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
}

export enum BondStatus {
  ACTIVE = 'Active',
  PENDING = 'En attente',
  MATURED = 'Mature',
  CANCELED = 'Annulée'
}

export interface Bond {
  id: string;
  name: string;
  investedAmount: number;
  yieldRate: number;
  subscriptionDate: string;
  maturityDate: string;
  expectedReturn: number;
  status: BondStatus;
}

export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    suggestions?: string[];
}
