import type { Account, AuthSession, DashboardOverview, Instrument, InvestmentOrder, Profile, Subscription, Transaction } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const SESSION_KEY = 'profin.core.session';

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthSession : null;
  } catch {
    return null;
  }
}

export function storeSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const raw = await response.text();
  let payload: unknown = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }
  if (!response.ok) {
    const detail = typeof payload === 'object' && payload && 'detail' in payload ? String((payload as { detail: unknown }).detail) : `Erreur API (${response.status})`;
    throw new Error(detail);
  }
  return payload as T;
}

export const api = {
  login: (email: string, password: string) => request<{ success: boolean; tokens: AuthSession['tokens']; client: AuthSession['client'] }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (refreshToken: string) => request('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
  dashboard: (token: string) => request<DashboardOverview>('/dashboard/overview', {}, token),
  recentTransactions: (token: string) => request<{ transactions: Transaction[] }>('/dashboard/transactions/recentes?limit=8', {}, token),
  activeInvestments: (token: string) => request<{ investissements: Subscription[] }>('/dashboard/investissements', {}, token),
  accounts: (token: string) => request<{ accounts: Account[] }>('/comptes/', {}, token),
  openAccount: (token: string, payload: { account_type: string; currency: string }) => request<{ account: Account }>('/comptes/', { method: 'POST', body: JSON.stringify(payload) }, token),
  instruments: (token: string) => request<{ instruments: Instrument[] }>('/instruments/', {}, token),
  subscriptions: (token: string) => request<{ subscriptions: Subscription[] }>('/souscriptions/mes-souscriptions', {}, token),
  subscribe: (token: string, payload: { account_id: number; instrument_id: number; invested_amount: number }) => request<{ subscription: Subscription }>('/souscriptions/', { method: 'POST', body: JSON.stringify(payload) }, token),
  submitOrder: (token: string, payload: { account_id: number; instrument_id: number; amount: number; client_comment?: string }) => request<{ order: InvestmentOrder }>('/ordres/', { method: 'POST', body: JSON.stringify(payload) }, token),
  orders: (token: string) => request<{ total: number; orders: InvestmentOrder[] }>('/ordres/mes-ordres', {}, token),
  reviewOrderStep: (token: string, orderId: number, stepCode: string, decision: 'APPROVE' | 'REJECT', notes?: string) => request<{ order: InvestmentOrder }>(`/ordres/${orderId}/steps/${stepCode}`, { method: 'POST', body: JSON.stringify({ decision, notes }) }, token),
  cancelOrder: (token: string, orderId: number) => request<{ order: InvestmentOrder }>(`/ordres/${orderId}/cancel`, { method: 'POST' }, token),
  redeem: (token: string, id: number) => request<{ souscription: Subscription }>(`/souscriptions/${id}/racheter`, { method: 'POST' }, token),
  generateMaturities: (token: string, asOf?: string) => request<{ total: number; transactions: Transaction[] }>(`/souscriptions/maintenance/maturites${asOf ? `?as_of=${asOf}` : ''}`, { method: 'POST' }, token),
  transactions: (token: string) => request<{ transactions: Transaction[] }>('/transactions/mes-transactions', {}, token),
  createTransaction: (token: string, payload: Record<string, unknown>) => request<{ transaction: Transaction }>('/transactions/', { method: 'POST', body: JSON.stringify(payload) }, token),
  approve: (token: string, id: number) => request<{ transaction: Transaction }>(`/transactions/${id}/approve`, { method: 'POST' }, token),
  reject: (token: string, id: number, reason: string) => request<{ transaction: Transaction }>(`/transactions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }, token),
  profile: (token: string) => request<Profile>('/profil', {}, token),
  updateProfile: (token: string, payload: Record<string, string>) => request<Profile>('/profil', { method: 'PATCH', body: JSON.stringify(payload) }, token),
};
