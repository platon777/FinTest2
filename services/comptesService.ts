import httpClient, { handleApiError } from './httpClient';

// Types pour les comptes
export interface Compte {
  CompteID: number;
  NumeroCompte: string;
  TypeCompte: 'INVESTISSEMENT' | 'CASH' | 'EPARGNE';
  Devise: 'HTG' | 'USD' | 'EUR';
  Solde: number;
  SoldeDisponible: number;
  DateOuverture: string;
  StatutCompte: 'ACTIF' | 'SUSPENDU' | 'FERME';
  Role?: string;
  NomTitulaire?: string;
}

export interface CreateCompteData {
  ClientID: number;
  NumeroCompte: string;
  TypeCompte: 'INVESTISSEMENT' | 'CASH' | 'EPARGNE';
  Devise: 'HTG' | 'USD' | 'EUR';
  Role?: 'TITULAIRE_PRINCIPAL' | 'TITULAIRE_SECONDAIRE' | 'MANDATAIRE';
}

export interface CompteDetail extends Compte {
  DateFermeture?: string;
  // Informations supplémentaires
  roles?: Array<{
    ClientID: number;
    Role: string;
    NomClient: string;
  }>;
}

// Service comptes
class ComptesService {
  /**
   * Créer un nouveau compte
   * POST /comptes/
   */
  async createCompte(data: CreateCompteData): Promise<Compte> {
    try {
      const response = await httpClient.post<{
        success: boolean;
        message: string;
        compte: Compte;
      }>('/comptes/', data);
      return response.data.compte;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer la liste des comptes du client
   * GET /comptes/mes-comptes
   */
  async getMesComptes(statut?: 'ACTIF' | 'SUSPENDU' | 'FERME'): Promise<Compte[]> {
    try {
      const params = statut ? { statut } : {};
      const response = await httpClient.get<{
        total: number;
        comptes: Compte[];
      }>('/comptes/mes-comptes', { params });
      return response.data.comptes;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les détails d'un compte spécifique
   * GET /comptes/{compte_id}
   */
  async getCompte(compteId: number): Promise<CompteDetail> {
    try {
      const response = await httpClient.get<CompteDetail>(`/comptes/${compteId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Suspendre un compte
   * PUT /comptes/{compte_id}/suspendre
   */
  async suspendCompte(compteId: number): Promise<void> {
    try {
      await httpClient.put(`/comptes/${compteId}/suspendre`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Fermer un compte
   * DELETE /comptes/{compte_id}
   */
  async closeCompte(compteId: number): Promise<void> {
    try {
      await httpClient.delete(`/comptes/${compteId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const comptesService = new ComptesService();

export default comptesService;
