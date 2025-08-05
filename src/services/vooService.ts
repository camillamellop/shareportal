import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { SolicitacaoVoo, PlanoVoo, NotificacaoVoo } from '@/types/voo';

export class VooService {
  private solicitacoesCollection = 'solicitacoes_voo';
  private planosCollection = 'planos_voo';
  private notificacoesCollection = 'notificacoes_voo';

  // SOLICITAÇÕES DE VOO
  async criarSolicitacao(solicitacao: Omit<SolicitacaoVoo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.solicitacoesCollection), {
        ...solicitacao,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Criar notificação para coordenador
      await this.criarNotificacao({
        tipo: 'solicitacao_nova',
        titulo: 'Nova Solicitação de Voo',
        mensagem: `${solicitacao.cotista_nome} solicitou um voo para ${solicitacao.data_voo_desejada}`,
        solicitacao_id: docRef.id,
        destinatario_tipo: 'coordenador',
        destinatario_id: 'coordenador_principal', // TODO: integrar com sistema de usuários
        lida: false
      });

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw error;
    }
  }

  async obterSolicitacoes(filtros?: { status?: string; cotista?: string }): Promise<SolicitacaoVoo[]> {
    try {
      let q = query(
        collection(db, this.solicitacoesCollection),
        orderBy('createdAt', 'desc')
      );

      if (filtros?.status) {
        q = query(q, where('status', '==', filtros.status));
      }

      if (filtros?.cotista) {
        q = query(q, where('cotista_id', '==', filtros.cotista));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SolicitacaoVoo));
    } catch (error) {
      console.error('Erro ao obter solicitações:', error);
      throw error;
    }
  }

  async atualizarStatusSolicitacao(id: string, status: SolicitacaoVoo['status']): Promise<void> {
    try {
      const docRef = doc(db, this.solicitacoesCollection, id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // PLANOS DE VOO
  async criarPlanoVoo(plano: Omit<PlanoVoo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.planosCollection), {
        ...plano,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Atualizar status da solicitação para 'programado'
      if (plano.solicitacao_id) {
        await this.atualizarStatusSolicitacao(plano.solicitacao_id, 'programado');
      }

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar plano de voo:', error);
      throw error;
    }
  }

  async obterPlanosVoo(filtros?: { status?: string; data?: string }): Promise<PlanoVoo[]> {
    try {
      let q = query(
        collection(db, this.planosCollection),
        orderBy('data_voo', 'asc')
      );

      if (filtros?.status) {
        q = query(q, where('status', '==', filtros.status));
      }

      if (filtros?.data) {
        q = query(q, where('data_voo', '==', filtros.data));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PlanoVoo));
    } catch (error) {
      console.error('Erro ao obter planos de voo:', error);
      throw error;
    }
  }

  async atualizarStatusPlano(id: string, status: PlanoVoo['status']): Promise<void> {
    try {
      const docRef = doc(db, this.planosCollection, id);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });

      // Se o voo foi concluído, atualizar a solicitação também
      if (status === 'concluido') {
        const planoDoc = await getDoc(docRef);
        if (planoDoc.exists()) {
          const plano = planoDoc.data() as PlanoVoo;
          if (plano.solicitacao_id) {
            await this.atualizarStatusSolicitacao(plano.solicitacao_id, 'concluido');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status do plano:', error);
      throw error;
    }
  }

  // NOTIFICAÇÕES
  async criarNotificacao(notificacao: Omit<NotificacaoVoo, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.notificacoesCollection), {
        ...notificacao,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async obterNotificacoes(destinatarioId: string, destinatarioTipo: string): Promise<NotificacaoVoo[]> {
    try {
      const q = query(
        collection(db, this.notificacoesCollection),
        where('destinatario_id', '==', destinatarioId),
        where('destinatario_tipo', '==', destinatarioTipo),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NotificacaoVoo));
    } catch (error) {
      console.error('Erro ao obter notificações:', error);
      throw error;
    }
  }

  async marcarNotificacaoComoLida(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.notificacoesCollection, id);
      await updateDoc(docRef, {
        lida: true
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // UTILS
  async obterDashboardCoordenador() {
    try {
      const [solicitacoesPendentes, voosProgramados, voosHoje] = await Promise.all([
        this.obterSolicitacoes({ status: 'solicitado' }),
        this.obterPlanosVoo({ status: 'programado' }),
        this.obterPlanosVoo({ data: new Date().toISOString().split('T')[0] })
      ]);

      return {
        solicitacoesPendentes: solicitacoesPendentes.length,
        voosProgramados: voosProgramados.length,
        voosHoje: voosHoje.length,
        solicitacoes: solicitacoesPendentes.slice(0, 5), // Últimas 5
        voos: voosProgramados.slice(0, 5) // Próximos 5
      };
    } catch (error) {
      console.error('Erro ao obter dashboard:', error);
      throw error;
    }
  }
}

export const vooService = new VooService();