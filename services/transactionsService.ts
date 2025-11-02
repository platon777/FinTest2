import httpClient, { handleApiError } from './httpClient';

// Types pour les transactions
export interface Transaction {
  TransactionID: number;
  TypeTransaction: string;
  Montant: number;
  Devise: 'HTG' | 'USD' | 'EUR';
  Description?: string;
  StatutTransaction: 'EN_ATTENTE' | 'EXECUTEE' | 'ECHOUEE' | 'ANNULEE';
  DateCreation: string;
  DateExecution?: string;
  CompteSource?: number;
  CompteDestination?: number;
  SouscriptionID?: number;
  EstAutomatique: boolean;
  // Informations supplémentaires (si incluses)
  compte_source_numero?: string;
  compte_destination_numero?: string;
  instrument_code?: string;
  instrument_nom?: string;
}

export interface CreateDepotData {
  CompteDestination: number;
  Montant: number;
  Devise: 'HTG' | 'USD' | 'EUR';
  Description?: string;
}

export interface CreateRetraitData {
  CompteSource: number;
  Montant: number;
  Devise: 'HTG' | 'USD' | 'EUR';
  Description?: string;
}

export interface CreateTransfertData {
  CompteSource: number;
  CompteDestination: number;
  Montant: number;
  Devise: 'HTG' | 'USD' | 'EUR';
  Description?: string;
}

// Service transactions
class TransactionsService {
  /**
   * Créer un dépôt
   * POST /transactions/depot
   */
  async createDepot(data: CreateDepotData): Promise<Transaction> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        transaction: Transaction;
      }>('/transactions/depot', data);
      return response.data.transaction;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Créer un retrait
   * POST /transactions/retrait
   */
  async createRetrait(data: CreateRetraitData): Promise<Transaction> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        transaction: Transaction;
      }>('/transactions/retrait', data);
      return response.data.transaction;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Créer un transfert
   * POST /transactions/transfert
   */
  async createTransfert(data: CreateTransfertData): Promise<Transaction> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        transaction: Transaction;
      }>('/transactions/transfert', data);
      return response.data.transaction;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer l'historique des transactions du client
   * GET /transactions/mes-transactions
   */
  async getMesTransactions(limit: number = 100): Promise<Transaction[]> {
    try {
      const response = await httpClient.get<{
        total: number;
        transactions: Transaction[];
      }>('/transactions/mes-transactions', {
        params: { limit },
      });
      return response.data.transactions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les transactions d'un compte spécifique
   * GET /transactions/compte/{compte_id}
   */
  async getTransactionsByCompte(compteId: number, limit: number = 100): Promise<{
    compte_id: number;
    compte_numero: string;
    total: number;
    transactions: Transaction[];
  }> {
    try {
      const response = await httpClient.get<{
        compte_id: number;
        compte_numero: string;
        total: number;
        transactions: Transaction[];
      }>(`/transactions/compte/${compteId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les détails d'une transaction spécifique
   * GET /transactions/{transaction_id}
   */
  async getTransaction(transactionId: number): Promise<Transaction> {
    try {
      const response = await httpClient.get<Transaction>(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const transactionsService = new TransactionsService();

export default transactionsService;
