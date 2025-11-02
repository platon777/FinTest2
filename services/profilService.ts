import httpClient, { handleApiError } from './httpClient';

// Types pour le profil
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
  // Pour client individuel
  prenom?: string;
  nom?: string;
  dateNaissance?: string;
  nationalite?: string;
  typePieceIdentite?: string;
  numeroPieceIdentite?: string;
  profession?: string;
  sourceRevenus?: string;
  // Pour client institutionnel
  nomEntreprise?: string;
  numeroRegistreCommerce?: string;
  formeJuridique?: string;
  secteur?: string;
  dateCreationEntreprise?: string;
  chiffreAffairesAnnuel?: number;
  nomRepresentantLegal?: string;
  // Profil investisseur
  profilInvestisseur?: {
    niveauRisque?: 'CONSERVATEUR' | 'MODERE' | 'AGRESSIF';
    revenuAnnuel?: number;
  };
}

export interface UpdateProfilData {
  telephone?: string;
  adresse_ligne1?: string;
  adresse_ligne2?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  profession?: string;
  source_revenus?: string;
  revenu_annuel_estime?: number;
  profil_risque?: 'CONSERVATEUR' | 'MODERE' | 'AGRESSIF';
}

// Service profil
class ProfilService {
  /**
   * Récupérer le profil complet du client
   * GET /profil/
   */
  async getProfil(): Promise<ClientProfil> {
    try {
      const response = await httpClient.get<ClientProfil>('/profil/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mettre à jour le profil du client
   * PATCH /profil/
   */
  async updateProfil(data: UpdateProfilData): Promise<ClientProfil> {
    try {
      const response = await httpClient.patch<{
        success: boolean;
        message: string;
        profil: ClientProfil;
      }>('/profil/', data);
      return response.data.profil;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const profilService = new ProfilService();

export default profilService;
