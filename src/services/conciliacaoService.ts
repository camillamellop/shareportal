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
import { DespesaPendente, MovimentacaoBancaria, LancamentoManual, ConciliacaoRelatorio } from '@/types/conciliacao';

export class ConciliacaoService {
  private despesasCollection = 'despesas_pendentes';
  private movimentacoesCollection = 'movimentacoes_bancarias';
  private lancamentosCollection = 'lancamentos_manuais';

  // DESPESAS PENDENTES
  async criarDespesaPendente(despesa: Omit<DespesaPendente, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.despesasCollection), {
        ...despesa,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar despesa pendente:', error);
      throw error;
    }
  }

  async obterDespesasPendentes(filtros?: { 
    categoria?: string; 
    status?: string; 
    periodo_inicio?: string; 
    periodo_fim?: string 
  }): Promise<DespesaPendente[]> {
    try {
      let q = query(
        collection(db, this.despesasCollection),
        orderBy('createdAt', 'desc')
      );

      if (filtros?.categoria) {
        q = query(q, where('categoria', '==', filtros.categoria));
      }

      if (filtros?.status) {
        q = query(q, where('status', '==', filtros.status));
      }

      const querySnapshot = await getDocs(q);
      
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DespesaPendente));
      
      return result;
    } catch (error) {
      console.error('Erro ao obter despesas pendentes:', error);
      throw error;
    }
  }

  async atualizarStatusDespesa(
    id: string, 
    status: DespesaPendente['status'], 
    dados?: {
      data_envio?: string;
      data_pagamento?: string;
      comprovante_envio?: string;
      comprovante_pagamento?: string;
      forma_pagamento?: string;
      observacoes?: string;
    }
  ): Promise<void> {
    try {
      const docRef = doc(db, this.despesasCollection, id);
      await updateDoc(docRef, {
        status,
        ...dados,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar status da despesa:', error);
      throw error;
    }
  }

  // MOVIMENTAÇÕES BANCÁRIAS
  async criarMovimentacao(movimentacao: Omit<MovimentacaoBancaria, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.movimentacoesCollection), {
        ...movimentacao,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      throw error;
    }
  }

  async obterMovimentacoes(filtros?: { 
    periodo_inicio?: string; 
    periodo_fim?: string;
    categoria?: string;
    conciliado?: boolean;
  }): Promise<MovimentacaoBancaria[]> {
    try {
      let q = query(
        collection(db, this.movimentacoesCollection),
        orderBy('data', 'desc')
      );

      if (filtros?.categoria) {
        q = query(q, where('categoria', '==', filtros.categoria));
      }

      if (filtros?.conciliado !== undefined) {
        q = query(q, where('conciliado', '==', filtros.conciliado));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MovimentacaoBancaria));
    } catch (error) {
      console.error('Erro ao obter movimentações:', error);
      throw error;
    }
  }

  async conciliarMovimentacao(id: string, despesa_id?: string): Promise<void> {
    try {
      const docRef = doc(db, this.movimentacoesCollection, id);
      await updateDoc(docRef, {
        conciliado: true,
        despesa_id: despesa_id || null
      });
    } catch (error) {
      console.error('Erro ao conciliar movimentação:', error);
      throw error;
    }
  }

  // LANÇAMENTOS MANUAIS
  async criarLancamentoManual(lancamento: Omit<LancamentoManual, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.lancamentosCollection), {
        ...lancamento,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Se deve gerar despesa, criar automaticamente
      if (lancamento.gerar_despesa) {
        const dadosDespesa: any = {
          tipo: 'lancamento_manual',
          categoria: lancamento.categoria,
          origem_id: docRef.id,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          data_criacao: new Date().toISOString().split('T')[0],
          status: 'criada'
        };

        // Adicionar campos condicionalmente
        if (lancamento.categoria === 'cliente') {
          dadosDespesa.cliente_nome = lancamento.pessoa_nome;
          console.log('Criando despesa para cliente:', dadosDespesa);
        } else if (lancamento.categoria === 'colaborador') {
          dadosDespesa.colaborador_nome = lancamento.pessoa_nome;
          console.log('Criando despesa para colaborador:', dadosDespesa);
        }

        // Adicionar campos opcionais
        if (lancamento.numero_documento_aeronave) {
          dadosDespesa.numero_documento_aeronave = lancamento.numero_documento_aeronave;
        }

        if (lancamento.numero_documento) {
          dadosDespesa.numero_documento = lancamento.numero_documento;
        }

        if (lancamento.data_vencimento) {
          dadosDespesa.data_vencimento = lancamento.data_vencimento;
        }

        if (lancamento.observacoes) {
          dadosDespesa.observacoes = lancamento.observacoes;
        }

        if (lancamento.arquivos && lancamento.arquivos.length > 0) {
          dadosDespesa.arquivos = lancamento.arquivos;
        }

        await this.criarDespesaPendente(dadosDespesa);
      }

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar lançamento manual:', error);
      throw error;
    }
  }

  async obterLancamentosManuais(categoria?: string): Promise<LancamentoManual[]> {
    try {
      let q = query(
        collection(db, this.lancamentosCollection),
        orderBy('createdAt', 'desc')
      );

      if (categoria) {
        q = query(q, where('categoria', '==', categoria));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LancamentoManual));
    } catch (error) {
      console.error('Erro ao obter lançamentos manuais:', error);
      throw error;
    }
  }

  // RELATÓRIOS
  async gerarRelatorioConciliacao(periodo_inicio: string, periodo_fim: string): Promise<ConciliacaoRelatorio> {
    try {
      const despesas = await this.obterDespesasPendentes({ periodo_inicio, periodo_fim });
      
      const total_despesas_pendentes = despesas
        .filter(d => ['pendente_envio', 'enviado', 'pendente_pagamento'].includes(d.status))
        .reduce((sum, d) => sum + d.valor, 0);

      const total_despesas_pagas = despesas
        .filter(d => d.status === 'pago')
        .reduce((sum, d) => sum + d.valor, 0);

      const despesas_por_status = {
        pendente_envio: despesas.filter(d => d.status === 'pendente_envio').length,
        enviado: despesas.filter(d => d.status === 'enviado').length,
        pendente_pagamento: despesas.filter(d => d.status === 'pendente_pagamento').length,
        pago: despesas.filter(d => d.status === 'pago').length,
        cancelado: despesas.filter(d => d.status === 'cancelado').length
      };

      const despesas_por_categoria = {
        cliente: despesas.filter(d => d.categoria === 'cliente').length,
        colaborador: despesas.filter(d => d.categoria === 'colaborador').length
      };

      return {
        periodo_inicio,
        periodo_fim,
        total_despesas_pendentes,
        total_despesas_pagas,
        total_recibos: despesas.filter(d => d.tipo === 'recibo').length,
        total_relatorios_viagem: despesas.filter(d => d.tipo === 'relatorio_viagem').length,
        total_lancamentos_manuais: despesas.filter(d => d.tipo === 'lancamento_manual').length,
        despesas_por_status,
        despesas_por_categoria
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  // INTEGRAÇÃO COM RECIBOS E RELATÓRIOS
 
async criarDespesaDeRecibo(reciboId: string, dadosRecibo: {
  numero: string;
  cliente_nome: string;
  valor: number;
  descricao: string;
  data: string;
}): Promise<string> {
  try {
    console.log('Criando despesa para recibo:', dadosRecibo);
    
    const despesaData = {
      tipo: 'recibo' as const,
      categoria: 'cliente' as const,
      origem_id: reciboId,
      numero_documento: dadosRecibo.numero,
      cliente_nome: dadosRecibo.cliente_nome,
      descricao: `Recibo #${dadosRecibo.numero} - ${dadosRecibo.descricao}`,
      valor: dadosRecibo.valor,
      data_criacao: dadosRecibo.data,
      status: 'pendente_envio' as const,
      data_ocorrencia: dadosRecibo.data,
      observacoes: `Despesa gerada automaticamente através do recibo #${dadosRecibo.numero}`
    };

    const despesaId = await this.criarDespesaPendente(despesaData);
    
    console.log('Despesa criada com sucesso:', despesaId);
    return despesaId;
  } catch (error) {
    console.error('Erro ao criar despesa de recibo:', error);
    throw error;
  }
  }

  async criarDespesaDeRelatorioViagem(relatorioId: string, dadosRelatorio: {
    numero: string;
    colaborador_nome: string;
    valor_total: number;
    descricao: string;
    data: string;
  }): Promise<string> {
    return this.criarDespesaPendente({
      tipo: 'relatorio_viagem',
      categoria: 'colaborador',
      origem_id: relatorioId,
      numero_documento: dadosRelatorio.numero,
      colaborador_nome: dadosRelatorio.colaborador_nome,
      descricao: `Relatório de Viagem #${dadosRelatorio.numero} - ${dadosRelatorio.descricao}`,
      valor: dadosRelatorio.valor_total,
      data_criacao: dadosRelatorio.data,
      status: 'pendente_envio'
    });
  }
}

export const conciliacaoService = new ConciliacaoService();