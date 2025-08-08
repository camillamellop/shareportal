import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface HorasVoo {
  id: string;
  tripulante_id: string;
  tripulante_nome: string;
  cargo: string;
  data_voo: string;
  hora_partida: string;
  hora_chegada: string;
  horas_voadas: number;
  origem: string;
  destino: string;
  aeronave_matricula: string;
  tipo_voo: 'comercial' | 'treinamento' | 'manutencao' | 'outro';
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  aprovado_por?: string;
  data_aprovacao?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ResumoHorasVoo {
  tripulante_id: string;
  tripulante_nome: string;
  cargo: string;
  total_horas: number;
  horas_mes_atual: number;
  horas_ano_atual: number;
  ultimo_voo: string;
  voos_realizados: number;
}

export class HorasVooService {
  private horasCollection = 'horas_voo';

  async criarRegistroHoras(horas: Omit<HorasVoo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.horasCollection), {
        ...horas,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar registro de horas:', error);
      throw error;
    }
  }

  async obterHorasVoo(filtros?: { 
    tripulante_id?: string; 
    data_inicio?: string; 
    data_fim?: string;
    status?: string;
  }): Promise<HorasVoo[]> {
    try {
      let q = query(collection(db, this.horasCollection));

      if (filtros?.tripulante_id) {
        q = query(q, where('tripulante_id', '==', filtros.tripulante_id));
      }

      if (filtros?.status) {
        q = query(q, where('status', '==', filtros.status));
      }

      if (filtros?.data_inicio) {
        q = query(q, where('data_voo', '>=', filtros.data_inicio));
      }

      if (filtros?.data_fim) {
        q = query(q, where('data_voo', '<=', filtros.data_fim));
      }

      q = query(q, orderBy('data_voo', 'desc'));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HorasVoo));
    } catch (error) {
      console.error('Erro ao obter horas de voo:', error);
      throw error;
    }
  }

  async obterResumoHorasVoo(): Promise<ResumoHorasVoo[]> {
    try {
      const horas = await this.obterHorasVoo();
      const resumos: Record<string, ResumoHorasVoo> = {};

      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      horas.forEach(hora => {
        if (!resumos[hora.tripulante_id]) {
          resumos[hora.tripulante_id] = {
            tripulante_id: hora.tripulante_id,
            tripulante_nome: hora.tripulante_nome,
            cargo: hora.cargo,
            total_horas: 0,
            horas_mes_atual: 0,
            horas_ano_atual: 0,
            ultimo_voo: '',
            voos_realizados: 0
          };
        }

        const resumo = resumos[hora.tripulante_id];
        resumo.total_horas += hora.horas_voadas;
        resumo.voos_realizados += 1;

        const dataVoo = new Date(hora.data_voo);
        if (dataVoo.getMonth() === mesAtual && dataVoo.getFullYear() === anoAtual) {
          resumo.horas_mes_atual += hora.horas_voadas;
        }

        if (dataVoo.getFullYear() === anoAtual) {
          resumo.horas_ano_atual += hora.horas_voadas;
        }

        if (!resumo.ultimo_voo || hora.data_voo > resumo.ultimo_voo) {
          resumo.ultimo_voo = hora.data_voo;
        }
      });

      return Object.values(resumos).sort((a, b) => b.total_horas - a.total_horas);
    } catch (error) {
      console.error('Erro ao obter resumo de horas:', error);
      throw error;
    }
  }

  async aprovarHoras(id: string, aprovado_por: string): Promise<void> {
    try {
      const docRef = doc(db, this.horasCollection, id);
      await updateDoc(docRef, {
        status: 'aprovado',
        aprovado_por,
        data_aprovacao: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao aprovar horas:', error);
      throw error;
    }
  }

  async rejeitarHoras(id: string, motivo: string): Promise<void> {
    try {
      const docRef = doc(db, this.horasCollection, id);
      await updateDoc(docRef, {
        status: 'rejeitado',
        observacoes: motivo,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao rejeitar horas:', error);
      throw error;
    }
  }
}

export const horasVooService = new HorasVooService();
