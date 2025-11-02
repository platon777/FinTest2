import httpClient, { handleApiError } from './httpClient';

// Types pour les souscriptions
export interface Souscription {
  SouscriptionID: number;
  CompteID: number;
  InstrumentID: number;
  MontantInvesti: number;
  NombreUnites: number;
  DateSouscription: string;
  DateMaturiteEffective: string;
  TauxSouscription: number;
  ValeurActuelle: number;
  InteretsAccumules: number;
  StatutSouscription: 'ACTIVE' | 'MATURE' | 'RACHETEE';
  // Informations de l'instrument (si incluses)
  instrument_nom?: string;
  instrument_code?: string;
  emetteur?: string;
  taux_rendement?: number;
  frequence_paiement?: string;
}

export interface CreateSouscriptionData {
  CompteID: number;
  InstrumentID: number;
  MontantInvesti: number;
}

export interface Portefeuille {
  total_investi: number;
  valeur_actuelle_totale: number;
  interets_accumules_total: number;
  nombre_souscriptions: number;
  souscriptions: Souscription[];
}

// Service souscriptions
class SouscriptionsService {
  /**
   * Créer une nouvelle souscription
   * POST /souscriptions/
   */
  async createSouscription(data: CreateSouscriptionData): Promise<{
    souscription: Souscription;
    transaction_id: number;
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        souscription: Souscription;
        transaction_id: number;
      }>('/souscriptions/', data);
      return {
        souscription: response.data.souscription,
        transaction_id: response.data.transaction_id,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer la liste des souscriptions du client
   * GET /souscriptions/mes-souscriptions
   */
  async getMesSouscriptions(): Promise<Souscription[]> {
    try {
      const response = await httpClient.get<{
        total: number;
        souscriptions: Souscription[];
      }>('/souscriptions/mes-souscriptions');
      return response.data.souscriptions;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer le portefeuille complet
   * GET /souscriptions/portefeuille
   */
  async getPortefeuille(): Promise<Portefeuille> {
    try {
      const response = await httpClient.get<Portefeuille>('/souscriptions/portefeuille');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les détails d'une souscription spécifique
   * GET /souscriptions/{souscription_id}
   */
  async getSouscription(souscriptionId: number): Promise<Souscription> {
    try {
      const response = await httpClient.get<Souscription>(`/souscriptions/${souscriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Racheter une souscription
   * POST /souscriptions/{souscription_id}/racheter
   */
  async racheterSouscription(souscriptionId: number): Promise<{
    message: string;
    transaction_id: number;
  }> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        transaction_id: number;
      }>(`/souscriptions/${souscriptionId}/racheter`);
      return {
        message: response.data.message,
        transaction_id: response.data.transaction_id,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const souscriptionsService = new SouscriptionsService();

export default souscriptionsService;
