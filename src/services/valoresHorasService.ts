import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface ValorHoraVoo {
  id: string;
  aeronave_matricula: string;
  modelo: string;
  valor_hora: number;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export class ValoresHorasService {
  private valoresCollection = 'valores_horas_voo';

  async criarValor(valor: Omit<ValorHoraVoo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.valoresCollection), {
        ...valor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar valor de hora:', error);
      throw error;
    }
  }

  async obterValores(): Promise<ValorHoraVoo[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.valoresCollection));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ValorHoraVoo));
    } catch (error) {
      console.error('Erro ao obter valores de hora:', error);
      throw error;
    }
  }

  async atualizarValor(id: string, dados: Partial<ValorHoraVoo>): Promise<void> {
    try {
      const docRef = doc(db, this.valoresCollection, id);
      await updateDoc(docRef, {
        ...dados,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar valor de hora:', error);
      throw error;
    }
  }

  async deletarValor(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.valoresCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar valor de hora:', error);
      throw error;
    }
  }

  async obterValorPorAeronave(matricula: string): Promise<ValorHoraVoo | null> {
    try {
      const valores = await this.obterValores();
      return valores.find(v => v.aeronave_matricula === matricula && v.status === 'ativo') || null;
    } catch (error) {
      console.error('Erro ao obter valor por aeronave:', error);
      throw error;
    }
  }
}

export const valoresHorasService = new ValoresHorasService();
