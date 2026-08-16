export type Page = 'overview' | 'investments' | 'operations' | 'accounts' | 'profile' | 'backoffice';

export interface CurrencyReport {
  currency: string;
  invested: number;
  current_value: number;
  accrued_interest: number;
  return_amount: number;
  return_percentage: number;
  available_cash: number;
  balance: number;
  active_positions: number;
  reserved_orders: number;
}

export interface ClientBusinessReport {
  as_of: string;
  generated_at: string;
  kpis: { active_positions: number; pending_orders: number; accounts: number; maturities_next_horizon: number };
  summary_by_currency: CurrencyReport[];
  allocation: { instrument_type: string; currency: string; current_value: number }[];
  positions: { subscription_id: number; account_id: number; instrument_code: string; instrument_name: string; instrument_type: string; currency: string; invested_amount: number; current_value: number; return_amount: number; return_percentage: number; maturity_date: string; days_to_maturity: number }[];
  order_pipeline: { status: string; count: number; amount_by_currency: Record<string, number> }[];
  maturities: { subscription_id: number; instrument_code: string; instrument_name: string; currency: string; current_value: number; maturity_date: string; days_to_maturity: number }[];
  cashflow: { month: string; currency: string; deposits: number; withdrawals: number; investments: number; maturities: number; net: number }[];
  alerts: { code: string; severity: string; title: string; detail: string }[];
}

export interface BackOfficeReport {
  as_of: string;
  generated_at: string;
  scope: { accounts: number; account_numbers: string[]; roles: string[] };
  kpis: { orders_in_review: number; transactions_pending: number; total_items_in_queue: number; active_accounts: number; active_positions: number; maturities_next_horizon: number };
  workflow: { step: string; count: number; amount_by_currency: Record<string, number>; oldest_age_days: number }[];
  queue: { queue_type: string; id: number; client_name: string; account_number?: string | null; operation: string; instrument_code?: string | null; amount: number; currency: string; status: string; next_step: string; age_days: number; created_at: string }[];
  positions_by_currency: { currency: string; current_value: number }[];
  exceptions: { code: string; severity: string; title: string; detail: string }[];
}

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

export interface OrderStep {
  step_code: string;
  status: string;
  actor_profile: string;
  notes?: string | null;
  completed_at?: string | null;
}

export interface InvestmentOrder {
  id: number;
  client_id: number;
  account_id: number;
  instrument_id: number;
  order_type: string;
  amount: number;
  units?: number | null;
  currency: string;
  status: string;
  client_comment?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  submitted_by_client_id: number;
  checked_by_client_id?: number | null;
  executed_transaction_id?: number | null;
  executed_subscription_id?: number | null;
  instrument_name?: string | null;
  instrument_code?: string | null;
  account_number?: string | null;
  steps: OrderStep[];
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
