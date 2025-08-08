import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { logger } from "@/utils/logger";

export interface Abastecimento {
  id: string;
  acft: string; // Matrícula da aeronave
  cotista: string;
  dataAbastecimento: string;
  abastecedor: string;
  numeroComanda: string;
  litros: number;
  valorUnitario: number;
  total: number;
  numeroFiscal: string;
  numeroBoleto: string;
  vencimento: string;
  email: boolean;
  rateio: boolean;
  observacoes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class AbastecimentoService {
  private collectionName = 'abastecimentos';

  async getAll(): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos carregados do Firestore', { count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Abastecimento | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Abastecimento;
      }
      
      return null;
    } catch (error) {
      logger.error('Erro ao buscar abastecimento por ID', error);
      throw error;
    }
  }

  async create(data: Omit<Abastecimento, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      logger.info('Abastecimento criado no Firestore', { id: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Erro ao criar abastecimento', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Abastecimento>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);
      logger.info('Abastecimento atualizado no Firestore', { id });
    } catch (error) {
      logger.error('Erro ao atualizar abastecimento', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      logger.info('Abastecimento excluído do Firestore', { id });
    } catch (error) {
      logger.error('Erro ao excluir abastecimento', error);
      throw error;
    }
  }

  async getByAircraft(acft: string): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('acft', '==', acft),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos por aeronave carregados', { acft, count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos por aeronave', error);
      throw error;
    }
  }

  async getByCotista(cotista: string): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cotista', '==', cotista),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos por cotista carregados', { cotista, count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos por cotista', error);
      throw error;
    }
  }

  async getByDateRange(dataInicio: string, dataFim: string): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('dataAbastecimento', '>=', dataInicio),
        where('dataAbastecimento', '<=', dataFim),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos por período carregados', { dataInicio, dataFim, count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos por período', error);
      throw error;
    }
  }

  async getPendentesEmail(): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('email', '==', false),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos pendentes de email carregados', { count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos pendentes de email', error);
      throw error;
    }
  }

  async getPendentesRateio(): Promise<Abastecimento[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('rateio', '==', true),
        orderBy('dataAbastecimento', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const abastecimentos: Abastecimento[] = [];
      
      querySnapshot.forEach((doc) => {
        abastecimentos.push({
          id: doc.id,
          ...doc.data()
        } as Abastecimento);
      });

      logger.info('Abastecimentos pendentes de rateio carregados', { count: abastecimentos.length });
      return abastecimentos;
    } catch (error) {
      logger.error('Erro ao carregar abastecimentos pendentes de rateio', error);
      throw error;
    }
  }

  async getEstatisticas(): Promise<{
    totalRegistros: number;
    totalLitros: number;
    totalValor: number;
    pendentesEmail: number;
    pendentesRateio: number;
  }> {
    try {
      const abastecimentos = await this.getAll();
      
      const totalRegistros = abastecimentos.length;
      const totalLitros = abastecimentos.reduce((sum, item) => sum + item.litros, 0);
      const totalValor = abastecimentos.reduce((sum, item) => sum + item.total, 0);
      const pendentesEmail = abastecimentos.filter(item => !item.email).length;
      const pendentesRateio = abastecimentos.filter(item => item.rateio).length;

      const estatisticas = {
        totalRegistros,
        totalLitros,
        totalValor,
        pendentesEmail,
        pendentesRateio
      };

      logger.info('Estatísticas de abastecimento calculadas', estatisticas);
      return estatisticas;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas de abastecimento', error);
      throw error;
    }
  }
}

export const abastecimentoService = new AbastecimentoService();
