import { UserData, DetailedTransactionType, TransactionWorkflowStatus, SubscriptionStatus, AccountType, AccountStatus, Instrument, InstrumentStatus, PaymentFrequency } from '../types';

// --- Market Instruments Catalog ---
const mockInstruments: Instrument[] = [
    { 
        instrumentId: 1001, instrumentType: 'OBLIGATION', code: 'OBL-BRH-2025-001', name: 'Obligation BRH 5.5% 2025', 
        description: "Obligation émise par la Banque de la République d'Haïti.", issuer: "Banque de la République d'Haïti",
        annualYieldRate: 5.50, issueDate: '2022-06-15', maturityDate: '2025-06-15', nominalValue: 1000, minInvestment: 5000,
        currency: 'USD', interestPaymentFrequency: PaymentFrequency.ANNUAL, status: InstrumentStatus.AVAILABLE
    },
    { 
        instrumentId: 1002, instrumentType: 'OBLIGATION', code: 'OBL-GOV-2028-002', name: 'Obligation Souveraine 4.2% 2028',
        description: "Obligation du trésor pour le financement de projets d'infrastructure.", issuer: 'Gouvernement Haïtien',
        annualYieldRate: 4.20, issueDate: '2023-01-20', maturityDate: '2028-01-20', nominalValue: 1000, minInvestment: 10000,
        currency: 'USD', interestPaymentFrequency: PaymentFrequency.QUARTERLY, status: InstrumentStatus.AVAILABLE
    },
    { 
        instrumentId: 1003, instrumentType: 'OBLIGATION', code: 'OBL-CORP-2026-003', name: 'Obligation Corporative Innova 6.8% 2026',
        description: "Obligation émise par le groupe Innova pour son expansion.", issuer: 'Innova Group',
        annualYieldRate: 6.80, issueDate: '2023-11-30', maturityDate: '2026-11-30', nominalValue: 500, minInvestment: 2500,
        currency: 'USD', interestPaymentFrequency: PaymentFrequency.AT_MATURITY, status: InstrumentStatus.SOLD_OUT
    },
    { 
        instrumentId: 1004, instrumentType: 'OBLIGATION', code: 'OBL-GREEN-2024-004', name: 'Obligation Verte Énergie 2024',
        description: "Financement de projets d'énergie renouvelable.", issuer: 'Energie Plus SA',
        annualYieldRate: 4.0, issueDate: '2021-01-10', maturityDate: '2024-01-10', nominalValue: 1000, minInvestment: 1000,
        currency: 'USD', interestPaymentFrequency: PaymentFrequency.ANNUAL, status: InstrumentStatus.EXPIRED
    }
];


// --- User-Specific Data ---

const jeanDupontData: UserData = {
  user: {
    id: 'user-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', clientType: 'Individuel',
    phone: '+33 6 12 34 56 78', address: '123 Rue de la République, 75001 Paris, France',
    investorProfile: { type: 'Personne physique', riskLevel: 'Modéré', investmentHorizon: 'Moyen terme', annualIncome: '50k-75k USD' },
    associatedAccounts: [ { id: 'acct-2', name: 'Innovatech SARL', type: 'Entreprise' }, { id: 'acct-3', name: 'Marie Dupont', type: 'Personnel' } ]
  },
  accounts: [
    { accountId: 101, accountNumber: 'INV-2023-00001', accountType: AccountType.INVESTMENT, currency: 'USD', balance: 52600, availableBalance: 2600, openingDate: '2023-01-15', status: AccountStatus.ACTIVE },
    { accountId: 102, accountNumber: 'SVG-2023-00002', accountType: AccountType.EPARGNE, currency: 'HTG', balance: 250000, availableBalance: 250000, openingDate: '2023-03-20', status: AccountStatus.ACTIVE }
  ],
  subscriptions: [
    { subscriptionId: 2001, accountId: 101, instrumentId: 1001, investedAmount: 20000, units: 20, subscriptionDate: '2023-06-15', effectiveMaturityDate: '2025-06-15', rateOnSubscription: 5.50, currentValue: 20900, accumulatedInterest: 900, status: SubscriptionStatus.ACTIVE },
    { subscriptionId: 2002, accountId: 101, instrumentId: 1002, investedAmount: 15000, units: 15, subscriptionDate: '2023-12-20', effectiveMaturityDate: '2028-01-20', rateOnSubscription: 4.20, currentValue: 15300, accumulatedInterest: 300, status: SubscriptionStatus.ACTIVE },
    { subscriptionId: 2003, accountId: 101, instrumentId: 1004, investedAmount: 10000, units: 10, subscriptionDate: '2021-01-10', effectiveMaturityDate: '2024-01-10', rateOnSubscription: 4.00, currentValue: 10800, accumulatedInterest: 800, status: SubscriptionStatus.MATURED }
  ],
  transactions: [
    { transactionId: 3001, transactionType: DetailedTransactionType.DEPOSIT, sourceAccountId: null, destinationAccountId: 101, amount: 5000, currency: 'USD', description: 'Virement entrant salaire', status: TransactionWorkflowStatus.EXECUTED, createdBy: 1, creationDate: '2024-07-20T10:00:00Z', validatedBy: 2, validationDate: '2024-07-20T11:00:00Z', executionDate: '2024-07-20T11:05:00Z', isAutomatic: false },
    { transactionId: 3002, transactionType: DetailedTransactionType.SUBSCRIPTION, sourceAccountId: 101, destinationAccountId: null, amount: 20000, currency: 'USD', description: 'Souscription OBL-BRH-2025-001', status: TransactionWorkflowStatus.EXECUTED, createdBy: 1, creationDate: '2023-06-15T14:00:00Z', validatedBy: 2, validationDate: '2023-06-15T15:00:00Z', executionDate: '2023-06-15T15:05:00Z', isAutomatic: false, subscriptionId: 2001 },
    // Fix: Corrected enum member to PENDING_VALIDATION
    { transactionId: 3003, transactionType: DetailedTransactionType.WITHDRAWAL, sourceAccountId: 101, destinationAccountId: null, amount: 1000, currency: 'USD', description: 'Retrait en ligne', status: TransactionWorkflowStatus.PENDING_VALIDATION, createdBy: 1, creationDate: '2024-07-25T09:00:00Z', isAutomatic: false, makerComments: 'Retrait demandé par client' },
  ],
  portfolio: { totalValue: 50000, totalReturnPercentage: 5.2, totalReturnAmount: 2600, activeSubscriptionsCount: 2, evolution: [ { month: 'Jan', value: 48000 }, { month: 'Fév', value: 48500 }, { month: 'Mar', value: 49200 }, { month: 'Avr', value: 49800 }, { month: 'Mai', value: 50100 }, { month: 'Juin', value: 50000 } ] },
  instruments: mockInstruments
};

const innovatechData: UserData = {
  user: {
    id: 'acct-2', name: 'Innovatech SARL', email: 'contact@innovatech.com', clientType: 'Institutionnel',
    phone: '+33 1 98 76 54 32', address: '456 Avenue des Champs-Élysées, 75008 Paris, France',
    investorProfile: { type: 'Personne morale', riskLevel: 'Élevé', investmentHorizon: 'Long terme' }
  },
  accounts: [
    { accountId: 201, accountNumber: 'CASH-2022-00003', accountType: AccountType.CASH, currency: 'USD', balance: 850000, availableBalance: 825000, openingDate: '2022-02-01', status: AccountStatus.ACTIVE },
    { accountId: 202, accountNumber: 'INV-2022-00005', accountType: AccountType.INVESTMENT, currency: 'USD', balance: 750000, availableBalance: 750000, openingDate: '2022-02-01', status: AccountStatus.ACTIVE },
  ],
  subscriptions: [
    { subscriptionId: 2004, accountId: 202, instrumentId: 1002, investedAmount: 500000, units: 500, subscriptionDate: '2023-01-20', effectiveMaturityDate: '2028-01-20', rateOnSubscription: 4.20, currentValue: 515000, accumulatedInterest: 15000, status: SubscriptionStatus.ACTIVE },
    { subscriptionId: 2005, accountId: 202, instrumentId: 1003, investedAmount: 250000, units: 500, subscriptionDate: '2023-11-30', effectiveMaturityDate: '2026-11-30', rateOnSubscription: 6.80, currentValue: 262000, accumulatedInterest: 12000, status: SubscriptionStatus.ACTIVE }
  ],
  transactions: [
    { transactionId: 3004, transactionType: DetailedTransactionType.DEPOSIT, sourceAccountId: null, destinationAccountId: 201, amount: 100000, currency: 'USD', description: 'Apport en capital', status: TransactionWorkflowStatus.EXECUTED, createdBy: 1, creationDate: '2024-07-22T11:00:00Z', validatedBy: 2, validationDate: '2024-07-22T12:00:00Z', executionDate: '2024-07-22T12:05:00Z', isAutomatic: false },
    { transactionId: 3005, transactionType: DetailedTransactionType.INTEREST_PAYMENT, sourceAccountId: null, destinationAccountId: 202, amount: 5250, currency: 'USD', description: 'Paiement intérêt OBL-GOV-2028-002', status: TransactionWorkflowStatus.EXECUTED, createdBy: 99, creationDate: '2024-07-20T00:00:00Z', executionDate: '2024-07-20T00:00:01Z', isAutomatic: true, subscriptionId: 2004 },
  ],
  portfolio: { totalValue: 750000, totalReturnPercentage: 8.1, totalReturnAmount: 60750, activeSubscriptionsCount: 2, evolution: [ { month: 'Jan', value: 720000 }, { month: 'Fév', value: 735000 }, { month: 'Mar', value: 742000 }, { month: 'Avr', value: 748000 }, { month: 'Mai', value: 755000 }, { month: 'Juin', value: 750000 } ] },
  instruments: mockInstruments
};

const marieDupontData: UserData = {
  user: {
    id: 'acct-3', name: 'Marie Dupont', email: 'marie.d@email.com', clientType: 'Individuel',
    phone: '+33 7 89 01 23 45', address: '123 Rue de la République, 75001 Paris, France',
    investorProfile: { type: 'Personne physique', riskLevel: 'Faible', investmentHorizon: 'Court terme', annualIncome: '30k-50k USD' }
  },
  accounts: [ { accountId: 301, accountNumber: 'INV-2023-00006', accountType: AccountType.INVESTMENT, currency: 'USD', balance: 15000, availableBalance: 15000, openingDate: '2023-01-15', status: AccountStatus.ACTIVE } ],
  subscriptions: [
    { subscriptionId: 2006, accountId: 301, instrumentId: 1001, investedAmount: 15000, units: 15, subscriptionDate: '2023-01-15', effectiveMaturityDate: '2025-06-15', rateOnSubscription: 5.20, currentValue: 15375, accumulatedInterest: 375, status: SubscriptionStatus.ACTIVE }
  ],
  transactions: [
    { transactionId: 3006, transactionType: DetailedTransactionType.DEPOSIT, sourceAccountId: null, destinationAccountId: 301, amount: 1000, currency: 'USD', description: 'Virement Épargne', status: TransactionWorkflowStatus.EXECUTED, createdBy: 1, creationDate: '2024-05-10T18:00:00Z', validatedBy: 2, validationDate: '2024-05-10T18:30:00Z', executionDate: '2024-05-10T18:31:00Z', isAutomatic: false },
  ],
  portfolio: { totalValue: 15000, totalReturnPercentage: 2.5, totalReturnAmount: 375, activeSubscriptionsCount: 1, evolution: [ { month: 'Jan', value: 14800 }, { month: 'Fév', value: 14850 }, { month: 'Mar', value: 14900 }, { month: 'Avr', value: 14950 }, { month: 'Mai', value: 15050 }, { month: 'Juin', value: 15000 } ] },
  instruments: mockInstruments
};

export const mockDatabase: Record<string, UserData> = {
    'user-1': jeanDupontData,
    'acct-2': innovatechData,
    'acct-3': marieDupontData
};