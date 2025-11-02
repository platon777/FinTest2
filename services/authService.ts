import httpClient, { handleApiError } from './httpClient';

// Types pour l'authentification
export interface RegisterData {
  client_type: 'INDIVIDUEL' | 'INSTITUTIONNEL';
  email: string;
  password: string;
  // Pour client individuel
  prenom?: string;
  nom?: string;
  date_naissance?: string;
  numero_piece_identite?: string;
  // Pour client institutionnel
  nom_entreprise?: string;
  numero_registre_commerce?: string;
  forme_juridique?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  tokens: AuthTokens;
  client: {
    client_id: number;
    email: string;
    client_type: 'INDIVIDUEL' | 'INSTITUTIONNEL';
    prenom?: string;
    nom?: string;
    nom_entreprise?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  client_id: number;
  email: string;
}

// Service d'authentification
class AuthService {
  /**
   * Inscrire un nouveau client
   * POST /auth/register
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await httpClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Connexion d'un client
   * POST /auth/login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', data);

      // Sauvegarder les tokens et les infos client
      if (response.data.success && response.data.tokens) {
        this.saveTokens(response.data.tokens);
        this.saveUserInfo(response.data.client);
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Rafraîchir le token d'accès
   * POST /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await httpClient.post<{ tokens: AuthTokens }>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      // Sauvegarder les nouveaux tokens
      if (response.data.tokens) {
        this.saveTokens(response.data.tokens);
      }

      return response.data.tokens;
    } catch (error) {
      // Si le refresh échoue, nettoyer le storage
      this.clearAuth();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Déconnexion d'un client
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await httpClient.post('/auth/logout', {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      // Même si l'appel échoue, on déconnecte quand même
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      this.clearAuth();
    }
  }

  /**
   * Sauvegarder les tokens dans le localStorage
   */
  private saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at',
      String(Date.now() + tokens.expires_in * 1000)
    );
  }

  /**
   * Sauvegarder les informations de l'utilisateur
   */
  private saveUserInfo(client: AuthResponse['client']): void {
    localStorage.setItem('user', JSON.stringify(client));
  }

  /**
   * Récupérer les informations de l'utilisateur depuis le localStorage
   */
  getUserInfo(): AuthResponse['client'] | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing des infos utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    // Vérifier si le token n'est pas expiré
    return Date.now() < parseInt(expiresAt, 10);
  }

  /**
   * Récupérer le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupérer le refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Nettoyer toutes les données d'authentification
   */
  clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('active_account_id');
  }
}

// Export une instance unique (Singleton)
export const authService = new AuthService();

export default authService;
