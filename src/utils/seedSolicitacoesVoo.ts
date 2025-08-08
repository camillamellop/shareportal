import { vooService } from "@/services/vooService";

const solicitacoesExemplo = [
  {
    cotista_id: "demo_user",
    cotista_nome: "João Silva",
    aeronave_matricula: "PT-WSR",
    origem: "SIVR",
    destino: "SBAT",
    data_voo_desejada: "2025-01-15",
    hora_partida_desejada: "14:00",
    passageiros: 2,
    motivo: "Viagem de negócios",
    observacoes: "Preferência por voo matutino",
    status: "solicitado" as const
  },
  {
    cotista_id: "demo_user",
    cotista_nome: "João Silva",
    aeronave_matricula: "PT-WSR",
    origem: "SBAT",
    destino: "SBCY",
    data_voo_desejada: "2025-01-20",
    hora_partida_desejada: "16:30",
    passageiros: 1,
    motivo: "Reunião executiva",
    observacoes: "Retorno no mesmo dia",
    status: "programado" as const
  },
  {
    cotista_id: "demo_user",
    cotista_nome: "João Silva",
    aeronave_matricula: "PT-WSR",
    origem: "SBCY",
    destino: "SWLV",
    data_voo_desejada: "2025-01-25",
    hora_partida_desejada: "09:00",
    passageiros: 3,
    motivo: "Férias em família",
    observacoes: "Voo turístico",
    status: "concluido" as const
  },
  {
    cotista_id: "demo_user",
    cotista_nome: "João Silva",
    aeronave_matricula: "PT-WSR",
    origem: "SWLV",
    destino: "SBSI",
    data_voo_desejada: "2025-02-01",
    hora_partida_desejada: "15:00",
    passageiros: 2,
    motivo: "Visita técnica",
    observacoes: "Equipamentos especiais",
    status: "solicitado" as const
  },
  {
    cotista_id: "demo_user",
    cotista_nome: "João Silva",
    aeronave_matricula: "PT-WSR",
    origem: "SBSI",
    destino: "SIVR",
    data_voo_desejada: "2025-02-05",
    hora_partida_desejada: "11:00",
    passageiros: 1,
    motivo: "Retorno ao escritório",
    observacoes: "Voo direto",
    status: "programado" as const
  }
];

export const seedSolicitacoesVoo = async () => {
  try {
    console.log("Iniciando seed de solicitações de voo...");
    
    for (const solicitacao of solicitacoesExemplo) {
      console.log(`Criando solicitação:`, solicitacao);
      const solicitacaoId = await vooService.criarSolicitacao(solicitacao);
      console.log(`Solicitação criada com ID: ${solicitacaoId}`);
    }
    
    console.log("Seed de solicitações de voo concluído!");
  } catch (error) {
    console.error("Erro ao fazer seed de solicitações de voo:", error);
  }
}; 