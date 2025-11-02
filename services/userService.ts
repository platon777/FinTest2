import httpClient, { handleApiError } from './httpClient';

// Types pour les utilisateurs
export interface UserProfile {
  client_id: number;
  email: string;
  client_type: 'INDIVIDUEL' | 'INSTITUTIONNEL';
  prenom?: string;
  nom?: string;
  nom_entreprise?: string;
  statut_client: 'ACTIF' | 'SUSPENDU' | 'FERME';
  date_naissance?: string;
  numero_piece_identite?: string;
  telephone?: string;
  adresse_ligne1?: string;
  ville?: string;
  pays?: string;
  profil_risque?: 'CONSERVATEUR' | 'MODERE' | 'AGRESSIF';
  revenu_annuel_estime?: number;
}

// Service utilisateur
class UserService {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * GET /users/me
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await httpClient.get<UserProfile>('/users/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const userService = new UserService();

export default userService;
