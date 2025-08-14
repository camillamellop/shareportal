import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/integrations/firebase/config';

export interface Tripulante {
  id?: string;
  nome: string;
  cargo: string;
  cpf: string;
  telefone: string;
  email: string;
  codigoANAC: string;
  categoria: string;
  dataNascimento: string;
  localNascimento: string;
  status: 'ativo' | 'inativo';
  observacoes: string;
  foto: string;
  horasVoo: number;
  
  // Certificados
  cht: {
    numero: string;
    validade: string;
    status: 'valido' | 'proximo_vencimento' | 'vencido';
  };
  cma: {
    numero: string;
    validade: string;
    status: 'valido' | 'proximo_vencimento' | 'vencido';
  };
  habilitacoes: Array<{
    tipo: string;
    validade: string;
    status: 'valido' | 'proximo_vencimento' | 'vencido';
  }>;
  ingles: {
    nivel: string;
    validade: string;
    status: 'valido' | 'proximo_vencimento' | 'vencido';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

class TripulacaoService {
  private collectionName = 'tripulacao';

  // Adicionar novo tripulante
  async adicionarTripulante(tripulante: Omit<Tripulante, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...tripulante,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar tripulante:', error);
      throw error;
    }
  }

  // Criar novo tripulante (alias para adicionarTripulante)
  async criarTripulante(tripulante: Omit<Tripulante, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.adicionarTripulante(tripulante);
  }

  // Buscar todos os tripulantes
  async buscarTripulantes(): Promise<Tripulante[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('nome', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tripulante[];
    } catch (error) {
      console.error('Erro ao buscar tripulantes:', error);
      throw error;
    }
  }

  // Buscar tripulante por ID
  async buscarTripulantePorId(id: string): Promise<Tripulante | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Tripulante;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar tripulante:', error);
      throw error;
    }
  }

  // Atualizar tripulante
  async atualizarTripulante(id: string, dados: Partial<Tripulante>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...dados,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Erro ao atualizar tripulante:', error);
      throw error;
    }
  }

  // Excluir tripulante
  async excluirTripulante(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao excluir tripulante:', error);
      throw error;
    }
  }

  // Buscar tripulantes por status de certificado
  async buscarPorStatusCertificado(status: 'vencido' | 'proximo_vencimento'): Promise<Tripulante[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('cht.status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tripulante[];
    } catch (error) {
      console.error('Erro ao buscar por status:', error);
      throw error;
    }
  }

  // Upload de foto
  async uploadFoto(file: File, tripulanteId: string): Promise<string> {
    try {
      const storageRef = ref(storage, `tripulacao/${tripulanteId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    }
  }

  // Buscar estatísticas
  async buscarEstatisticas(): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    chtVencidos: number;
    cmaVencidos: number;
    proximosVencimentos: number;
  }> {
    try {
      const tripulantes = await this.buscarTripulantes();
      
      return {
        total: tripulantes.length,
        ativos: tripulantes.filter(t => t.status === 'ativo').length,
        inativos: tripulantes.filter(t => t.status === 'inativo').length,
        chtVencidos: tripulantes.filter(t => t.cht.status === 'vencido').length,
        cmaVencidos: tripulantes.filter(t => t.cma.status === 'vencido').length,
        proximosVencimentos: tripulantes.filter(t => 
          t.cht.status === 'proximo_vencimento' || 
          t.cma.status === 'proximo_vencimento'
        ).length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const tripulacaoService = new TripulacaoService();
export default tripulacaoService;