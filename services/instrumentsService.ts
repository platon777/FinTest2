import httpClient, { handleApiError } from './httpClient';

// Types pour les instruments
export interface Instrument {
  InstrumentID: number;
  Code: string;
  Nom: string;
  Emetteur: string;
  TauxRendementAnnuel: number;
  DateEmission: string;
  DateMaturite: string;
  ValeurNominale: number;
  MontantMinimum: number;
  Devise: 'HTG' | 'USD' | 'EUR';
  FrequencePaiementInterets: 'MENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL' | 'A_MATURITE';
  StatutInstrument: 'DISPONIBLE' | 'EPUISE' | 'EXPIRE';
  TypeInstrumentID: number;
  TypeInstrument?: string;
  Description?: string;
}

export interface InstrumentType {
  TypeInstrumentID: number;
  Code: string;
  Nom: string;
  Description?: string;
}

// Service instruments
class InstrumentsService {
  /**
   * Récupérer la liste des instruments disponibles pour investissement
   * GET /instruments/disponibles
   */
  async getInstrumentsDisponibles(): Promise<Instrument[]> {
    try {
      const response = await httpClient.get<{
        total: number;
        instruments: Instrument[];
      }>('/instruments/disponibles');
      return response.data.instruments;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer tous les instruments
   * GET /instruments/
   */
  async getAllInstruments(statut?: 'DISPONIBLE' | 'EPUISE' | 'EXPIRE'): Promise<Instrument[]> {
    try {
      const params = statut ? { statut } : {};
      const response = await httpClient.get<{
        total: number;
        instruments: Instrument[];
      }>('/instruments/', { params });
      return response.data.instruments;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer les détails d'un instrument spécifique
   * GET /instruments/{instrument_id}
   */
  async getInstrument(instrumentId: number): Promise<Instrument> {
    try {
      const response = await httpClient.get<Instrument>(`/instruments/${instrumentId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Récupérer la liste des types d'instruments
   * GET /instruments/types/
   */
  async getInstrumentTypes(): Promise<InstrumentType[]> {
    try {
      const response = await httpClient.get<InstrumentType[]>('/instruments/types/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export une instance unique (Singleton)
export const instrumentsService = new InstrumentsService();

export default instrumentsService;
