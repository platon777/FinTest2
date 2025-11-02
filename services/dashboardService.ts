import httpClient, { handleApiError } from './httpClient';

// Types pour le dashboard
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

export interface CompleteDashboard {
  overview: DashboardOverview;
  recentTransactions: RecentTransaction[];
  activeInvestments: ActiveInvestment[];
  monthlyStats: MonthlyStatistic[];
}

// Service dashboard
class DashboardService {
  /**
   * Récupérer la vue d'ensemble du portefeuille
   * GET /dashboard/overview
   */
  async getOverview(compteId?: number): Promise<DashboardOverview> {
    try {
      const params = compteId ? { compte_id: compteId } : {};
      const response = await httpClient.get<{ success: boolean; data: DashboardOverview }>(
        '/dashboard/overview',
        { params }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les dernières transactions
   * GET /dashboard/transactions/recentes
   */
  async getRecentTransactions(compteId?: number, limit: number = 5): Promise<RecentTransaction[]> {
    try {
      const params = {
        ...(compteId && { compte_id: compteId }),
        limit,
      };
      const response = await httpClient.get<{
        total: number;
        transactions: RecentTransaction[];
      }>('/dashboard/transactions/recentes', { params });
      return response.data.transactions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les investissements actifs
   * GET /dashboard/investissements
   */
  async getActiveInvestments(compteId?: number): Promise<ActiveInvestment[]> {
    try {
      const params = compteId ? { compte_id: compteId } : {};
      const response = await httpClient.get<{
        total: number;
        investissements: ActiveInvestment[];
      }>('/dashboard/investissements', { params });
      return response.data.investissements;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les statistiques mensuelles
   * GET /dashboard/statistiques/mensuelles
   */
  async getMonthlyStatistics(compteId?: number, months: number = 12): Promise<MonthlyStatistic[]> {
    try {
      const params = {
        ...(compteId && { compte_id: compteId }),
        mois: months,
      };
      const response = await httpClient.get<{ periodes: MonthlyStatistic[] }>(
        '/dashboard/statistiques/mensuelles',
        { params }
      );
      return response.data.periodes;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer le dashboard complet
   * GET /dashboard/complet
   */
  async getCompleteDashboard(compteId?: number): Promise<CompleteDashboard> {
    try {
      const params = compteId ? { compte_id: compteId } : {};
      const response = await httpClient.get<CompleteDashboard>('/dashboard/complet', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const dashboardService = new DashboardService();

export default dashboardService;
