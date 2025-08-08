import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';

export interface HorasVooTripulante {
  id: string;
  tripulante_nome: string;
  aeronave_matricula: string;
  mes: string; // formato: "2025-07"
  ano: number;
  mes_nome: string; // "JULHO 2025"
  horas_voadas: number; // em horas decimais (ex: 2.47 para 2h47min)
  horas_formatadas: string; // formato "02:47h"
  observacoes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ResumoHorasTripulante {
  tripulante_nome: string;
  mes: string;
  ano: number;
  mes_nome: string;
  total_horas: number;
  total_horas_formatadas: string;
  aeronaves: {
    matricula: string;
    horas: number;
    horas_formatadas: string;
  }[];
}

export class HorasVooTripulanteService {
  private horasCollection = 'horas_voo_tripulante';

  async criarRegistro(registro: Omit<HorasVooTripulante, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.horasCollection), {
        ...registro,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar registro de horas:', error);
      throw error;
    }
  }

  async obterHorasPorTripulante(tripulante?: string, mes?: string): Promise<HorasVooTripulante[]> {
    try {
      let q = query(collection(db, this.horasCollection));
      
      if (tripulante) {
        q = query(q, where('tripulante_nome', '==', tripulante));
      }
      
      if (mes) {
        q = query(q, where('mes', '==', mes));
      }
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HorasVooTripulante));
      
      // Ordenação client-side
      return results.sort((a, b) => {
        const dateA = new Date(a.createdAt as string);
        const dateB = new Date(b.createdAt as string);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Erro ao obter horas por tripulante:', error);
      throw error;
    }
  }

  async obterResumoPorMes(mes: string): Promise<ResumoHorasTripulante[]> {
    try {
      const horas = await this.obterHorasPorTripulante(undefined, mes);
      
      // Agrupar por tripulante
      const resumos = new Map<string, ResumoHorasTripulante>();
      
      horas.forEach(hora => {
        if (!resumos.has(hora.tripulante_nome)) {
          resumos.set(hora.tripulante_nome, {
            tripulante_nome: hora.tripulante_nome,
            mes: hora.mes,
            ano: hora.ano,
            mes_nome: hora.mes_nome,
            total_horas: 0,
            total_horas_formatadas: '00:00h',
            aeronaves: []
          });
        }
        
        const resumo = resumos.get(hora.tripulante_nome)!;
        resumo.total_horas += hora.horas_voadas;
        resumo.aeronaves.push({
          matricula: hora.aeronave_matricula,
          horas: hora.horas_voadas,
          horas_formatadas: hora.horas_formatadas
        });
      });
      
      // Calcular total formatado para cada resumo
      resumos.forEach(resumo => {
        resumo.total_horas_formatadas = this.formatarHoras(resumo.total_horas);
      });
      
      return Array.from(resumos.values());
    } catch (error) {
      console.error('Erro ao obter resumo por mês:', error);
      throw error;
    }
  }

  async atualizarRegistro(id: string, dados: Partial<HorasVooTripulante>): Promise<void> {
    try {
      const docRef = doc(db, this.horasCollection, id);
      await updateDoc(docRef, {
        ...dados,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      throw error;
    }
  }

  async deletarRegistro(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.horasCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      throw error;
    }
  }

  // Utilitários
  formatarHoras(horasDecimais: number): string {
    const horas = Math.floor(horasDecimais);
    const minutos = Math.round((horasDecimais - horas) * 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}h`;
  }

  converterParaHorasDecimais(horasFormatadas: string): number {
    // Converter "02:47h" para 2.783 horas
    const match = horasFormatadas.match(/(\d+):(\d+)h/);
    if (!match) return 0;
    
    const horas = parseInt(match[1]);
    const minutos = parseInt(match[2]);
    return horas + (minutos / 60);
  }

  obterMesesDisponiveis(): string[] {
    const meses = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth();
    
    const mesesDisponiveis: string[] = [];
    
    // Últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const data = new Date(anoAtual, mesAtual - i, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const mesNome = meses[mes];
      mesesDisponiveis.push(`${mesNome} ${ano}`);
    }
    
    return mesesDisponiveis;
  }
}

export const horasVooTripulanteService = new HorasVooTripulanteService();
