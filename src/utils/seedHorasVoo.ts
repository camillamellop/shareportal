import { horasVooService } from '@/services/horasVooService';

const dadosExemplo = [
  {
    tripulante_id: 'piloto1',
    tripulante_nome: 'João Silva',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-15',
    hora_partida: '08:00',
    hora_chegada: '10:30',
    horas_voadas: 2.5,
    origem: 'SBGR',
    destino: 'SBSP',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo comercial regular',
    status: 'aprovado' as const
  },
  {
    tripulante_id: 'piloto1',
    tripulante_nome: 'João Silva',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-16',
    hora_partida: '14:00',
    hora_chegada: '16:45',
    horas_voadas: 2.75,
    origem: 'SBSP',
    destino: 'SBGR',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo de retorno',
    status: 'aprovado' as const
  },
  {
    tripulante_id: 'copiloto1',
    tripulante_nome: 'Maria Santos',
    cargo: 'Copiloto',
    data_voo: '2024-01-15',
    hora_partida: '08:00',
    hora_chegada: '10:30',
    horas_voadas: 2.5,
    origem: 'SBGR',
    destino: 'SBSP',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo comercial regular',
    status: 'aprovado' as const
  },
  {
    tripulante_id: 'copiloto1',
    tripulante_nome: 'Maria Santos',
    cargo: 'Copiloto',
    data_voo: '2024-01-17',
    hora_partida: '09:30',
    hora_chegada: '11:00',
    horas_voadas: 1.5,
    origem: 'SBSP',
    destino: 'SBCF',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'treinamento' as const,
    observacoes: 'Treinamento de navegação',
    status: 'pendente' as const
  },
  {
    tripulante_id: 'piloto2',
    tripulante_nome: 'Carlos Oliveira',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-18',
    hora_partida: '07:00',
    hora_chegada: '09:15',
    horas_voadas: 2.25,
    origem: 'SBGR',
    destino: 'SBRJ',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo comercial',
    status: 'aprovado' as const
  },
  {
    tripulante_id: 'piloto2',
    tripulante_nome: 'Carlos Oliveira',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-19',
    hora_partida: '15:30',
    hora_chegada: '17:45',
    horas_voadas: 2.25,
    origem: 'SBRJ',
    destino: 'SBGR',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo de retorno',
    status: 'pendente' as const
  },
  {
    tripulante_id: 'mecanico1',
    tripulante_nome: 'Pedro Costa',
    cargo: 'Mecânico de Voo',
    data_voo: '2024-01-20',
    hora_partida: '10:00',
    hora_chegada: '11:30',
    horas_voadas: 1.5,
    origem: 'SBGR',
    destino: 'SBSP',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'manutencao' as const,
    observacoes: 'Voo de manutenção',
    status: 'aprovado' as const
  },
  {
    tripulante_id: 'piloto1',
    tripulante_nome: 'João Silva',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-21',
    hora_partida: '13:00',
    hora_chegada: '15:30',
    horas_voadas: 2.5,
    origem: 'SBSP',
    destino: 'SBCF',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo comercial',
    status: 'pendente' as const
  },
  {
    tripulante_id: 'copiloto2',
    tripulante_nome: 'Ana Pereira',
    cargo: 'Copiloto',
    data_voo: '2024-01-22',
    hora_partida: '08:30',
    hora_chegada: '10:00',
    horas_voadas: 1.5,
    origem: 'SBCF',
    destino: 'SBGR',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'treinamento' as const,
    observacoes: 'Treinamento de pouso',
    status: 'pendente' as const
  },
  {
    tripulante_id: 'piloto3',
    tripulante_nome: 'Roberto Lima',
    cargo: 'Piloto Comercial',
    data_voo: '2024-01-23',
    hora_partida: '16:00',
    hora_chegada: '18:30',
    horas_voadas: 2.5,
    origem: 'SBGR',
    destino: 'SBRJ',
    aeronave_matricula: 'PR-MDL',
    tipo_voo: 'comercial' as const,
    observacoes: 'Voo noturno',
    status: 'aprovado' as const
  }
];

export async function seedHorasVoo() {
  try {
    console.log('Iniciando população de dados de horas de voo...');
    
    for (const dados of dadosExemplo) {
      await horasVooService.criarRegistroHoras(dados);
      console.log(`Registro criado para ${dados.tripulante_nome} - ${dados.data_voo}`);
    }
    
    console.log('Dados de horas de voo populados com sucesso!');
  } catch (error) {
    console.error('Erro ao popular dados de horas de voo:', error);
  }
}

// Executar apenas se chamado diretamente
if (typeof window !== 'undefined') {
  // No browser, adicionar ao window para acesso via console
  (window as any).seedHorasVoo = seedHorasVoo;
}
