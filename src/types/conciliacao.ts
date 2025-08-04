export interface DespesaPendente {
  id: string;
  tipo: 'recibo' | 'relatorio_viagem' | 'lancamento_manual';
  categoria: 'cliente' | 'colaborador';
  origem_id?: string; // ID do recibo/relatório que originou a despesa
  numero_documento?: string;
  cliente_nome?: string;
  colaborador_nome?: string;
  descricao: string;
  valor: number;
  data_criacao: string;
  data_vencimento?: string;
  status: 'pendente_envio' | 'enviado' | 'pendente_pagamento' | 'pago' | 'cancelado';
  observacoes?: string;
  comprovante_envio?: string;
  comprovante_pagamento?: string;
  data_envio?: string;
  data_pagamento?: string;
  conta_bancaria?: string;
  forma_pagamento?: 'pix' | 'ted' | 'doc' | 'cheque' | 'dinheiro';
  createdAt: any;
  updatedAt: any;
}

export interface MovimentacaoBancaria {
  id: string;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: 'cliente' | 'colaborador' | 'operacional';
  descricao: string;
  valor: number;
  conta: string;
  documento?: string;
  despesa_id?: string; // Vinculação com despesa
  conciliado: boolean;
  observacoes?: string;
  createdAt: any;
}

export interface LancamentoManual {
  id: string;
  categoria: 'cliente' | 'colaborador';
  tipo: 'despesa' | 'reembolso';
  pessoa_nome: string;
  pessoa_documento?: string;
  descricao: string;
  valor: number;
  data_ocorrencia: string;
  observacoes?: string;
  arquivos?: string[];
  gerar_despesa: boolean; // Se deve gerar uma despesa pendente
  createdAt: any;
  updatedAt: any;
}

export interface ConciliacaoRelatorio {
  periodo_inicio: string;
  periodo_fim: string;
  total_despesas_pendentes: number;
  total_despesas_pagas: number;
  total_recibos: number;
  total_relatorios_viagem: number;
  total_lancamentos_manuais: number;
  despesas_por_status: {
    pendente_envio: number;
    enviado: number;
    pendente_pagamento: number;
    pago: number;
    cancelado: number;
  };
  despesas_por_categoria: {
    cliente: number;
    colaborador: number;
  };
}

export const STATUS_DESPESA_CONFIG = {
  pendente_envio: {
    label: 'Pendente de Envio',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    icon: '📤'
  },
  enviado: {
    label: 'Enviado',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '📨'
  },
  pendente_pagamento: {
    label: 'Pendente de Pagamento',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: '⏳'
  },
  pago: {
    label: 'Pago',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  cancelado: {
    label: 'cancelado',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: '❌'
  }
};

export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'ted', label: 'TED' },
  { value: 'doc', label: 'DOC' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'dinheiro', label: 'Dinheiro' }
];