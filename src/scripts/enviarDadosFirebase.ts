import { tripulacaoService } from '../services/tripulacaoService';

// Dados de exemplo para enviar ao Firebase
const dadosExemplo = [
  {
    nome: "WENDELL MUNIZ CANEDO SANTOS",
    cargo: "Piloto Comandante",
    cpf: "123.456.789-00",
    telefone: "(11) 99999-9999",
    email: "wendell.santos@portalshare.com.br",
    codigoANAC: "191100",
    categoria: "AB",
    dataNascimento: "1985-03-15",
    localNascimento: "São Paulo, SP",
    status: "ativo" as const,
    observacoes: "Piloto experiente com mais de 10 anos de experiência",
    foto: "",
    horasVoo: 3500,
    cht: {
      numero: "CHT-191100-AB",
      validade: "2025-12-31",
      status: "valido" as const
    },
    cma: {
      numero: "CMA-191100-1",
      validade: "2024-06-30",
      status: "proximo_vencimento" as const
    },
    habilitacoes: [
      {
        tipo: "Boeing 737",
        validade: "2025-08-15",
        status: "valido" as const
      },
      {
        tipo: "Airbus A320",
        validade: "2024-03-20",
        status: "vencido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 5",
      validade: "2025-05-10",
      status: "valido" as const
    }
  },
  {
    nome: "RODRIGO DE MORAIS TOSCANO",
    cargo: "Piloto Comercial",
    cpf: "987.654.321-00",
    telefone: "(11) 88888-8888",
    email: "rodrigo.toscano@portalshare.com.br",
    codigoANAC: "113374",
    categoria: "PC",
    dataNascimento: "1990-07-22",
    localNascimento: "Rio de Janeiro, RJ",
    status: "ativo" as const,
    observacoes: "Piloto comercial com especialização em voos regionais",
    foto: "",
    horasVoo: 2800,
    cht: {
      numero: "CHT-113374-PC",
      validade: "2024-11-15",
      status: "proximo_vencimento" as const
    },
    cma: {
      numero: "CMA-113374-1",
      validade: "2025-02-28",
      status: "valido" as const
    },
    habilitacoes: [
      {
        tipo: "Embraer E-Jet",
        validade: "2025-01-10",
        status: "valido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 4",
      validade: "2024-08-30",
      status: "proximo_vencimento" as const
    }
  },
  {
    nome: "MARINA COSTA SILVA",
    cargo: "Copiloto",
    cpf: "456.789.123-00",
    telefone: "(11) 77777-7777",
    email: "marina.silva@portalshare.com.br",
    codigoANAC: "200455",
    categoria: "CP",
    dataNascimento: "1995-11-08",
    localNascimento: "Belo Horizonte, MG",
    status: "ativo" as const,
    observacoes: "Copiloto em treinamento para comandante",
    foto: "",
    horasVoo: 1200,
    cht: {
      numero: "CHT-200455-CP",
      validade: "2025-06-20",
      status: "valido" as const
    },
    cma: {
      numero: "CMA-200455-1",
      validade: "2024-12-15",
      status: "proximo_vencimento" as const
    },
    habilitacoes: [
      {
        tipo: "ATR 72",
        validade: "2025-03-25",
        status: "valido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 4",
      validade: "2025-09-15",
      status: "valido" as const
    }
  },
  {
    nome: "CARLOS EDUARDO LIMA",
    cargo: "Piloto Privado",
    cpf: "789.123.456-00",
    telefone: "(11) 66666-6666",
    email: "carlos.lima@portalshare.com.br",
    codigoANAC: "150789",
    categoria: "PP",
    dataNascimento: "1988-04-12",
    localNascimento: "Brasília, DF",
    status: "ativo" as const,
    observacoes: "Piloto privado com experiência em voos executivos",
    foto: "",
    horasVoo: 800,
    cht: {
      numero: "CHT-150789-PP",
      validade: "2024-01-15",
      status: "vencido" as const
    },
    cma: {
      numero: "CMA-150789-1",
      validade: "2024-05-30",
      status: "vencido" as const
    },
    habilitacoes: [
      {
        tipo: "Cessna 172",
        validade: "2025-07-10",
        status: "valido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 3",
      validade: "2024-10-20",
      status: "proximo_vencimento" as const
    }
  }
];

async function enviarDadosParaFirebase() {
  try {
    console.log('🚀 Iniciando envio de dados para o Firebase...');
    
    for (const tripulante of dadosExemplo) {
      console.log(`📝 Adicionando tripulante: ${tripulante.nome}`);
      const id = await tripulacaoService.adicionarTripulante(tripulante);
      console.log(`✅ Tripulante adicionado com ID: ${id}`);
    }
    
    console.log('🎉 Todos os dados foram enviados com sucesso para o Firebase!');
    
    // Buscar estatísticas para confirmar
    const estatisticas = await tripulacaoService.buscarEstatisticas();
    console.log('📊 Estatísticas após envio:', estatisticas);
    
  } catch (error) {
    console.error('❌ Erro ao enviar dados para o Firebase:', error);
  }
}

// Executar o script
enviarDadosParaFirebase(); 