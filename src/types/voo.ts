export interface SolicitacaoVoo {
  id: string;
  cotista_id: string;
  cotista_nome: string;
  aeronave_id: string;
  aeronave_matricula: string;
  data_solicitacao: string;
  data_voo_desejada: string;
  hora_partida_desejada: string;
  origem: string;
  destino: string;
  passageiros: number;
  observacoes?: string;
  status: 'solicitado' | 'aprovado' | 'programado' | 'em_andamento' | 'concluido' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PlanoVoo {
  id: string;
  solicitacao_id: string;
  data_voo: string;
  hora_partida: string;
  hora_chegada_estimada: string;
  origem: string;
  destino: string;
  piloto_designado?: string;
  copiloto_designado?: string;
  aeronave_id: string;
  combustivel_estimado: number;
  observacoes_coordenador?: string;
  status: 'programado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificacaoVoo {
  id: string;
  tipo: 'solicitacao_nova' | 'voo_programado' | 'voo_cancelado' | 'voo_concluido';
  titulo: string;
  mensagem: string;
  solicitacao_id?: string;
  plano_id?: string;
  destinatario_tipo: 'coordenador' | 'cotista' | 'piloto';
  destinatario_id: string;
  lida: boolean;
  createdAt: Date | string;
}

export interface StatusVoo {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const STATUS_VOO_CONFIG: Record<string, StatusVoo> = {
  solicitado: {
    label: 'Solicitado',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: '📝'
  },
  aprovado: {
    label: 'Aprovado',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: '✅'
  },
  programado: {
    label: 'Programado',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: '📅'
  },
  em_andamento: {
    label: 'Em Andamento',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    icon: '✈️'
  },
  concluido: {
    label: 'Concluído',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: '🏁'
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: '❌'
  }
};