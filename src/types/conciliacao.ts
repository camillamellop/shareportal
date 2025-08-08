export interface DespesaPendente {
  id: string;
  tipo: 'recibo' | 'relatorio_viagem' | 'lancamento_manual';
  categoria: 'cliente' | 'colaborador';
  origem_id?: string; // ID do recibo/relatório que originou a despesa
  numero_documento?: string;
  numero_documento_aeronave?: string;
  cliente_nome?: string;
  colaborador_nome?: string;
  descricao: string;
  valor: number;
  data_criacao: string;
  data_vencimento?: string;
  status: 'criada' | 'faltando_envio' | 'enviada' | 'pendente_pagamento' | 'pago';
  observacoes?: string;
  comprovante_envio?: string;
  comprovante_pagamento?: string;
  data_envio?: string;
  data_pagamento?: string;
  conta_bancaria?: string;
  forma_pagamento?: 'pix' | 'ted' | 'doc' | 'cheque' | 'dinheiro';
  createdAt: Date | string;
  updatedAt: Date | string;
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
  createdAt: Date | string;
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
  numero_documento_aeronave?: string;
  data_vencimento?: string;
  observacoes?: string;
  arquivos?: string[];
  gerar_despesa: boolean; // Se deve gerar uma despesa pendente
  createdAt: Date | string;
  updatedAt: Date | string;
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
  criada: {
    label: 'Criada',
    color: '#3B82F6', // Azul
    bgColor: 'bg-blue-50',
    icon: '📝'
  },
  faltando_envio: {
    label: 'Faltando Envio',
    color: '#F59E0B', // Amarelo/Laranja
    bgColor: 'bg-orange-50',
    icon: '⚠️'
  },
  enviada: {
    label: 'Enviada',
    color: '#8B5CF6', // Roxo
    bgColor: 'bg-purple-50',
    icon: '📤'
  },
  pendente_pagamento: {
    label: 'Pendente Pagamento',
    color: '#EF4444', // Vermelho
    bgColor: 'bg-red-50',
    icon: '⏳'
  },
  pago: {
    label: 'Pago',
    color: '#10B981', // Verde
    bgColor: 'bg-green-50',
    icon: '✅'
  }
};

export const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'ted', label: 'TED' },
  { value: 'doc', label: 'DOC' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'dinheiro', label: 'Dinheiro' }
];