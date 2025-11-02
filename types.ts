// Authentication types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthUser {
  client_id: number;
  email: string;
  client_type: 'INDIVIDUEL' | 'INSTITUTIONNEL';
  prenom?: string;
  nom?: string;
  nom_entreprise?: string;
  statut_client?: 'ACTIF' | 'SUSPENDU' | 'FERME';
}

export interface SwitchableAccount {
    id: string;
    name: string;
    type: 'Personnel' | 'Entreprise';
}

// User Profile (legacy - for compatibility)
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
  associatedAccounts?: SwitchableAccount[];
}

// Complete Client Profile (from backend vw_ProfilClient)
export interface ClientProfil {
  clientId: number;
  clientType: 'INDIVIDUEL' | 'INSTITUTIONNEL';
  nomComplet?: string;
  email: string;
  telephone?: string;
  adresse?: {
    ligne1?: string;
    ligne2?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
  // For individual client
  prenom?: string;
  nom?: string;
  dateNaissance?: string;
  nationalite?: string;
  typePieceIdentite?: string;
  numeroPieceIdentite?: string;
  profession?: string;
  sourceRevenus?: string;
  // For institutional client
  nomEntreprise?: string;
  numeroRegistreCommerce?: string;
  formeJuridique?: string;
  secteur?: string;
  dateCreationEntreprise?: string;
  chiffreAffairesAnnuel?: number;
  nomRepresentantLegal?: string;
  // Investor profile
  profilInvestisseur?: {
    niveauRisque?: 'CONSERVATEUR' | 'MODERE' | 'AGRESSIF';
    revenuAnnuel?: number;
  };
}

export interface Portfolio {
  totalValue: number;
  totalReturnPercentage: number;
  totalReturnAmount: number;
  activeSubscriptionsCount: number;
  evolution: { month: string; value: number }[];
}

// Dashboard types (from backend)
export interface DashboardOverview {
  valeurTotale: number;
  rendementTotal: number;
  pourcentageRendement: number;
  nombreSouscriptionsActives: number;
  totalInvesti: number;
  devise: string;
  comptes?: Array<{
    compteId: number;
    numeroCompte: string;
    valeur: number;
  }>;
}

export interface RecentTransaction {
  transactionId: number;
  typeTransaction: string;
  description: string;
  montant: number;
  devise: string;
  dateCreation: string;
  statut: string;
  compteSource: string | null;
  compteDestination: string | null;
}

export interface ActiveInvestment {
  souscriptionId: number;
  nomInstrument: string;
  codeInstrument: string;
  montantInvesti: number;
  valeurActuelle: number;
  tauxSouscription: number;
  dateMaturite: string;
  progressionMaturite: number;
}

export interface MonthlyStatistic {
  mois: string;
  dateMois: string;
  valeurPortefeuille: number;
  nombreSouscriptions: number;
}

// --- DEPRECATED ---
// The old simple transaction type is replaced by the new detailed one
export enum TransactionType_DEPRECATED {
  DEPOSIT = 'Dépôt',
  WITHDRAWAL = 'Retrait',
  INVESTMENT = 'Investissement',
}
// --- DEPRECATED ---

// --- New Detailed Data Models based on SQL Schema ---

// 1. Instruments & Subscriptions

export enum InstrumentStatus {
    AVAILABLE = 'DISPONIBLE',
    SOLD_OUT = 'EPUISE',
    EXPIRED = 'EXPIRE'
}

export enum PaymentFrequency {
    MONTHLY = 'MENSUEL',
    QUARTERLY = 'TRIMESTRIEL',
    ANNUAL = 'ANNUEL',
    AT_MATURITY = 'A_MATURITE'
}

export interface Instrument {
    instrumentId: number;
    instrumentType: 'OBLIGATION' | 'ACTION' | 'FONDS';
    code: string;
    name: string;
    description: string;
    issuer: string;
    annualYieldRate?: number | null;
    issueDate: string;
    maturityDate?: string | null;
    nominalValue: number;
    minInvestment: number;
    currency: 'HTG' | 'USD' | 'EUR';
    interestPaymentFrequency?: PaymentFrequency | null;
    status: InstrumentStatus;
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    MATURED = 'MATURE',
    REDEEMED = 'RACHETEE' // Rachetée = sold before maturity
}

export interface Subscription {
    subscriptionId: number;
    accountId: number;
    instrumentId: number;
    investedAmount: number;
    units: number;
    subscriptionDate: string;
    effectiveMaturityDate?: string | null;
    rateOnSubscription: number;
    currentValue: number;
    accumulatedInterest: number;
    status: SubscriptionStatus;
}

export enum InterestPaymentStatus {
    PLANNED = 'PLANIFIE',
    EXECUTED = 'EXECUTE',
    FAILED = 'ECHOUE'
}

export interface InterestPayment {
    paymentId: number;
    subscriptionId: number;
    paymentDate: string;
    interestAmount: number;
    status: InterestPaymentStatus;
    transactionId?: number | null;
}

// 2. Client Accounts (from previous step, unchanged)

export enum AccountType {
    INVESTMENT = 'INVESTISSEMENT',
    CASH = 'CASH',
    EPARGNE = 'EPARGNE'
}

export enum AccountStatus {
    ACTIVE = 'ACTIF',
    SUSPENDED = 'SUSPENDU',
    CLOSED = 'FERME'
}

export interface ClientAccount {
    accountId: number;
    accountNumber: string;
    accountType: AccountType;
    currency: 'HTG' | 'USD' | 'EUR';
    balance: number;
    availableBalance: number;
    openingDate: string;
    closingDate?: string | null;
    status: AccountStatus;
}

// 3. New Detailed Transactions

export enum DetailedTransactionType {
    DEPOSIT = 'DEPOT',
    WITHDRAWAL = 'RETRAIT',
    SUBSCRIPTION = 'SOUSCRIPTION',
    REDEMPTION = 'RACHAT',
    INTEREST_PAYMENT = 'PAIEMENT_INTERET',
    MATURITY_REIMBURSEMENT = 'REMBOURSEMENT_MATURITE',
    TRANSFER = 'TRANSFERT'
}

export enum TransactionWorkflowStatus {
    DRAFT = 'BROUILLON',
    PENDING_VALIDATION = 'EN_ATTENTE_VALIDATION',
    VALIDATED = 'VALIDEE',
    EXECUTED = 'EXECUTEE',
    REJECTED = 'REJETEE',
    CANCELLED = 'ANNULEE',
    FAILED = 'ECHOUEE'
}

export interface Transaction {
    transactionId: number;
    transactionType: DetailedTransactionType;
    sourceAccountId?: number | null;
    destinationAccountId?: number | null;
    amount: number;
    currency: 'HTG' | 'USD' | 'EUR';
    description: string;
    status: TransactionWorkflowStatus;
    createdBy: number; // UserID of Maker
    creationDate: string;
    validatedBy?: number | null; // UserID of Checker
    validationDate?: string | null;
    executionDate?: string | null;
    makerComments?: string | null;
    checkerComments?: string | null;
    isAutomatic: boolean;
    subscriptionId?: number | null;
}


export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    suggestions?: string[];
}


// --- Updated UserData Structure ---

export interface UserData {
    user: User;
    portfolio: Portfolio;
    accounts: ClientAccount[];
    subscriptions: Subscription[];
    transactions: Transaction[];
    instruments: Instrument[]; // List of all available instruments
}
