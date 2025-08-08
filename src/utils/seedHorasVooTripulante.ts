import { horasVooTripulanteService } from '@/services/horasVooTripulanteService';

const dadosExemplo = [
  // WENDELL - JULHO 2025
  {
    tripulante_nome: 'WENDELL',
    aeronave_matricula: 'MDL',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 2.783, // 02:47h
    horas_formatadas: '02:47h',
    observacoes: 'Horas voadas em julho 2025'
  },
  {
    tripulante_nome: 'WENDELL',
    aeronave_matricula: 'WSR',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 17.667, // 17:40h
    horas_formatadas: '17:40h',
    observacoes: 'Horas voadas em julho 2025'
  },
  {
    tripulante_nome: 'WENDELL',
    aeronave_matricula: 'AVE',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 8.267, // 08:16h
    horas_formatadas: '08:16h',
    observacoes: 'Horas voadas em julho 2025'
  },
  
  // RODRIGO TOSCANO - JULHO 2025
  {
    tripulante_nome: 'RODRIGO TOSCANO',
    aeronave_matricula: 'MDL',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 9.950, // 09:57h
    horas_formatadas: '09:57h',
    observacoes: 'Horas voadas em julho 2025'
  },
  {
    tripulante_nome: 'RODRIGO TOSCANO',
    aeronave_matricula: 'WSR',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 10.550, // 10:33h
    horas_formatadas: '10:33h',
    observacoes: 'Horas voadas em julho 2025'
  },
  {
    tripulante_nome: 'RODRIGO TOSCANO',
    aeronave_matricula: 'OPC',
    mes: '2025-07',
    ano: 2025,
    mes_nome: 'JULHO 2025',
    horas_voadas: 9.433, // 09:26h
    horas_formatadas: '09:26h',
    observacoes: 'Horas voadas em julho 2025'
  }
];

export async function seedHorasVooTripulante() {
  try {
    console.log('Iniciando população de dados de horas voadas por tripulante...');
    
    for (const dados of dadosExemplo) {
      await horasVooTripulanteService.criarRegistro(dados);
      console.log(`Registro criado para ${dados.tripulante_nome} - ${dados.aeronave_matricula} - ${dados.horas_formatadas}`);
    }
    
    console.log('Dados de horas voadas por tripulante populados com sucesso!');
  } catch (error) {
    console.error('Erro ao popular dados de horas voadas por tripulante:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (typeof window !== 'undefined') {
  // No browser, adicionar ao window para acesso via console
  (window as any).seedHorasVooTripulante = seedHorasVooTripulante;
}
