export type Page = 'overview' | 'investments' | 'operations' | 'accounts' | 'profile';

export interface ClientInfo {
  client_id: number;
  email: string;
  client_type: 'INDIVIDUEL' | 'INSTITUTIONNEL';
  prenom?: string | null;
  nom?: string | null;
  nom_entreprise?: string | null;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface Account {
  id: number;
  account_number: string;
  account_type: string;
  currency: string;
  balance: number;
  available_balance: number;
  status: string;
  role?: string | null;
}

export interface Instrument {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  issuer: string;
  annual_yield: number;
  issue_date: string;
  maturity_date: string;
  nominal_value: number;
  minimum_amount: number;
  currency: string;
  interest_frequency: string;
  status: string;
  instrument_type?: string | null;
}

export interface Subscription {
  id: number;
  account_id: number;
  instrument_id: number;
  invested_amount: number;
  units: number;
  subscribed_at: string;
  effective_maturity_date: string;
  subscription_yield: number;
  current_value: number;
  accrued_interest: number;
  status: string;
  instrument_name?: string | null;
  instrument_code?: string | null;
  currency?: string | null;
}

export interface Transaction {
  id: number;
  transaction_type: string;
  source_account_id?: number | null;
  destination_account_id?: number | null;
  amount: number;
  currency: string;
  description?: string | null;
  status: string;
  created_at: string;
  executed_at?: string | null;
  is_automatic: boolean;
  subscription_id?: number | null;
  created_by_client_id?: number;
  approved_by_client_id?: number | null;
  rejection_reason?: string | null;
  source_account_number?: string | null;
  destination_account_number?: string | null;
}

export interface DashboardOverview {
  total_value: number;
  total_invested: number;
  total_return: number;
  return_percentage: number;
  active_subscriptions: number;
  accounts: Account[];
  currency: string;
}

export interface Profile {
  client_id: number;
  client_type: string;
  email: string;
  status: string;
  risk_profile: string;
  full_name: string;
  phone?: string | null;
  address?: { line1?: string; city?: string; postal_code?: string; country?: string } | null;
  individual?: Record<string, string | number | null> | null;
  institutional?: Record<string, string | number | null> | null;
}

export interface AuthSession {
  tokens: Tokens;
  client: ClientInfo;
}
