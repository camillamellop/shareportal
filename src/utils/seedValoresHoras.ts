import { valoresHorasService } from '@/services/valoresHorasService';

const dadosExemplo = [
  {
    aeronave_matricula: 'PT MDL',
    modelo: 'Piper Seneca V',
    valor_hora: 175.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave bimotor para voos comerciais'
  },
  {
    aeronave_matricula: 'PT WSR',
    modelo: 'Piper Cherokee',
    valor_hora: 178.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave confiável para voos regionais'
  },
  {
    aeronave_matricula: 'PT OPC',
    modelo: 'Cessna 152',
    valor_hora: 200.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave para treinamento de pilotos'
  },
  {
    aeronave_matricula: 'PS DMS',
    modelo: 'Piper Arrow',
    valor_hora: 180.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave para voos de média distância'
  },
  {
    aeronave_matricula: 'PT JPK',
    modelo: 'Piper Warrior',
    valor_hora: 120.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave para treinamento e voos locais'
  },
  {
    aeronave_matricula: 'PT TOR',
    modelo: 'Cessna 182',
    valor_hora: 175.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave versátil para diversos tipos de voo'
  },
  {
    aeronave_matricula: 'PT RVJ',
    modelo: 'Piper Seneca',
    valor_hora: 350.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave bimotor para voos comerciais de longa distância'
  },
  {
    aeronave_matricula: 'PS AVE',
    modelo: 'Piper Seneca',
    valor_hora: 250.00,
    status: 'ativo' as const,
    observacoes: 'Aeronave para voos comerciais de média distância'
  }
];

export async function seedValoresHoras() {
  try {
    console.log('Iniciando população de dados de valores de horas de voo...');
    
    for (const dados of dadosExemplo) {
      await valoresHorasService.criarValor(dados);
      console.log(`Valor criado para ${dados.aeronave_matricula} - ${dados.modelo}`);
    }
    
    console.log('Dados de valores de horas de voo populados com sucesso!');
  } catch (error) {
    console.error('Erro ao popular dados de valores de horas de voo:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (typeof window !== 'undefined') {
  // No browser, adicionar ao window para acesso via console
  (window as any).seedValoresHoras = seedValoresHoras;
}
