import { tripulacaoService } from "@/services/tripulacaoService";

const tripulantesExemplo = [
  {
    nome: "ROLFFE ERBE",
    cargo: "Piloto Comandante",
    cpf: "04949182927",
    telefone: "(11) 99999-9999",
    email: "rolffe@sharebrasil.net.br",
    codigoANAC: "130042",
    categoria: "AB",
    dataNascimento: "03/01/1986",
    localNascimento: "São Paulo, SP",
    status: "ativo" as const,
    observacoes: "Piloto experiente com mais de 15 anos de experiência",
    foto: "",
    horasVoo: 4500,
    cht: {
      numero: "CHT-130042-AB",
      validade: "2025-12-31",
      status: "valido" as const
    },
    cma: {
      numero: "CMA-130042-1",
      validade: "2024-09-20",
      status: "proximo_vencimento" as const
    },
    habilitacoes: [
      {
        tipo: "EMB-110",
        validade: "2025-02-10",
        status: "valido" as const
      },
      {
        tipo: "Cessna 172",
        validade: "2025-07-15",
        status: "valido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 4",
      validade: "2025-06-30",
      status: "valido" as const
    }
  },
  {
    nome: "WENDELL MUNIZ CANEDO SANTOS",
    cargo: "Piloto Comandante",
    cpf: "031.312.941-08",
    telefone: "(62) 99999-1111",
    email: "muniz.wsb@gmail.com",
    codigoANAC: "191100",
    categoria: "AB",
    dataNascimento: "13/02/1988",
    localNascimento: "Inhumas, GO",
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
      validade: "2024-09-20",
      status: "proximo_vencimento" as const
    },
    habilitacoes: [
      {
        tipo: "EMB-110",
        validade: "2025-02-10",
        status: "valido" as const
      },
      {
        tipo: "Cessna 172",
        validade: "2025-07-15",
        status: "valido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 4",
      validade: "2025-06-30",
      status: "valido" as const
    }
  },
  {
    nome: "RODRIGO DE MORAIS TOSCANO",
    cargo: "Piloto Comercial",
    cpf: "987.654.321-00",
    telefone: "(11) 88888-8888",
    email: "rodrigo@sharebrasil.net.br",
    codigoANAC: "113374",
    categoria: "PC",
    dataNascimento: "29/07/1980",
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
      },
      {
        tipo: "ATR 72",
        validade: "2024-08-30",
        status: "vencido" as const
      }
    ],
    ingles: {
      nivel: "ICAO 4",
      validade: "2024-08-30",
      status: "proximo_vencimento" as const
    }
  }
];

export const seedTripulacao = async () => {
  try {
    console.log("Iniciando seed de tripulação...");
    
    // Criar tripulantes
    console.log("Criando tripulantes...");
    for (const tripulante of tripulantesExemplo) {
      console.log(`Criando tripulante: ${tripulante.nome}`);
      const id = await tripulacaoService.adicionarTripulante(tripulante);
      console.log(`Tripulante ${tripulante.nome} criado com ID: ${id}`);
    }
    
    console.log("Seed de tripulação concluído!");
    
    // Verificar se foram criados
    const tripulantesCriados = await tripulacaoService.buscarTripulantes();
    console.log("Tripulantes criados:", tripulantesCriados.length);
    
    // Buscar estatísticas
    const estatisticas = await tripulacaoService.buscarEstatisticas();
    console.log("Estatísticas da tripulação:", estatisticas);
  } catch (error) {
    console.error("Erro ao fazer seed de tripulação:", error);
  }
}; 