import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Créer une instance Axios
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag pour éviter les boucles infinies lors du refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Intercepteur de requête - Ajouter le token d'authentification
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    // Ne pas ajouter le token pour les endpoints d'authentification
    const isAuthEndpoint = config.url?.includes('/auth/login') ||
                           config.url?.includes('/auth/register');

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gérer les erreurs et le refresh du token
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Retourner directement les réponses réussies
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Éviter les endpoints d'authentification
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // Pas de refresh token, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(error);
      }

      try {
        // Appeler l'endpoint de refresh
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data.tokens;

        // Sauvegarder les nouveaux tokens
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Mettre à jour le header de la requête originale
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Traiter la file d'attente
        processQueue(null, access_token);

        // Réessayer la requête originale
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, déconnecter l'utilisateur
        processQueue(refreshError as Error, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Gérer les autres erreurs
    return Promise.reject(error);
  }
);

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Helper pour extraire les données de la réponse
export const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  // Si la structure est différente, retourner directement
  return response.data as unknown as T;
};

// Helper pour gérer les erreurs
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;

    // Erreur de réponse du serveur
    if (axiosError.response) {
      const errorData = axiosError.response.data;

      if (errorData?.error?.message) {
        return errorData.error.message;
      }

      if (errorData?.message) {
        return errorData.message;
      }

      // Messages par défaut selon le code de statut
      switch (axiosError.response.status) {
        case 400:
          return 'Requête invalide. Veuillez vérifier les données saisies.';
        case 401:
          return 'Session expirée. Veuillez vous reconnecter.';
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        case 404:
          return 'Ressource non trouvée.';
        case 500:
          return 'Erreur serveur. Veuillez réessayer plus tard.';
        default:
          return `Erreur ${axiosError.response.status}: ${axiosError.message}`;
      }
    }

    // Erreur réseau ou pas de réponse
    if (axiosError.request) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    }

    // Erreur dans la configuration de la requête
    return `Erreur de requête: ${axiosError.message}`;
  }

  // Erreur inconnue
  return 'Une erreur inattendue s\'est produite.';
};

export default httpClient;
