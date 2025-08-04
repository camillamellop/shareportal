import { vooServiceSpecific, aeronaveServiceSpecific } from "@/services/firestore";

const voosExemplo = [
  // JUNHO 2025 - PT-WSR (Dados reais do diário)
  {
    data: "2025-06-01",
    hora_partida: "14:25",
    hora_chegada: "14:58",
    origem: "SIVR",
    destino: "SBAT",
    piloto: "PIC: 113374",
    cotista: "GRF",
    horas_voo: 0.31,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "113374",
    voo_para: "GRF"
  },
  {
    data: "2025-06-02",
    hora_partida: "16:32",
    hora_chegada: "18:50",
    origem: "SBAT",
    destino: "SBCY",
    piloto: "PIC: 113374",
    cotista: "GRF",
    horas_voo: 2.16,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "113374",
    voo_para: "GRF"
  },
  {
    data: "2025-06-03",
    hora_partida: "14:19",
    hora_chegada: "16:48",
    origem: "SBCY",
    destino: "SWLV",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 2.27,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "130042",
    voo_para: "GRF"
  },
  {
    data: "2025-06-17",
    hora_partida: "16:26",
    hora_chegada: "18:50",
    origem: "SWLV",
    destino: "SBSI",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 2.12,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "130042",
    voo_para: "GRF"
  },
  {
    data: "2025-06-18",
    hora_partida: "14:25",
    hora_chegada: "14:58",
    origem: "SBSI",
    destino: "SIVR",
    piloto: "PIC: 191100",
    cotista: "GRF",
    horas_voo: 0.39,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "191100",
    voo_para: "GRF"
  },
  {
    data: "2025-06-20",
    hora_partida: "16:32",
    hora_chegada: "17:13",
    origem: "SIVR",
    destino: "SBAT",
    piloto: "PIC: 191100",
    cotista: "GRF",
    horas_voo: 0.41,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "191100",
    voo_para: "GRF"
  },
  {
    data: "2025-06-21",
    hora_partida: "14:19",
    hora_chegada: "16:21",
    origem: "SBAT",
    destino: "SBCY",
    piloto: "PIC: 113374",
    cotista: "GRF",
    horas_voo: 2.02,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "113374",
    voo_para: "GRF"
  },
  {
    data: "2025-06-24",
    hora_partida: "16:26",
    hora_chegada: "18:09",
    origem: "SBCY",
    destino: "SWLV",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 1.43,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "130042",
    voo_para: "GRF"
  },
  {
    data: "2025-06-24",
    hora_partida: "18:32",
    hora_chegada: "18:44",
    origem: "SWLV",
    destino: "SWLV",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 0.12,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo local",
    pic_anac: "130042",
    voo_para: "GRF"
  },
  {
    data: "2025-06-24",
    hora_partida: "19:15",
    hora_chegada: "21:34",
    origem: "SWLV",
    destino: "SBSI",
    piloto: "PIC: 113374",
    cotista: "GRF",
    horas_voo: 2.19,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "113374",
    voo_para: "GRF"
  },
  {
    data: "2025-06-24",
    hora_partida: "21:45",
    hora_chegada: "00:03",
    origem: "SBSI",
    destino: "SIVR",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 2.18,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo comercial",
    pic_anac: "130042",
    voo_para: "GRF"
  },
  {
    data: "2025-06-24",
    hora_partida: "00:15",
    hora_chegada: "00:32",
    origem: "SIVR",
    destino: "SIVR",
    piloto: "PIC: 130042",
    cotista: "GRF",
    horas_voo: 0.17,
    combustivel_inicial: 462,
    combustivel_final: 462,
    observacoes: "Voo local",
    pic_anac: "130042",
    voo_para: "GRF"
  }
];

export const seedVoos = async (aeronaveMatricula: string) => {
  try {
    console.log(`Iniciando seed de voos para aeronave ${aeronaveMatricula}...`);
    
    // Buscar aeronave por matrícula
    const aeronave = await aeronaveServiceSpecific.getByMatricula(aeronaveMatricula);
    console.log("Aeronave encontrada para seed:", aeronave);
    
    if (!aeronave) {
      console.error(`Aeronave ${aeronaveMatricula} não encontrada`);
      return;
    }
    
    // Criar voos para a aeronave
    for (const voo of voosExemplo) {
      console.log(`Criando voo:`, voo);
      const vooData = {
        ...voo,
        aeronave_id: aeronave.id
      };
      console.log("Dados do voo para salvar:", vooData);
      
      const vooId = await vooServiceSpecific.create(vooData);
      console.log(`Voo criado com ID: ${vooId} para ${aeronaveMatricula}`);
    }
    
    console.log(`Seed de voos concluído para ${aeronaveMatricula}!`);
    
    // Verificar se os voos foram criados
    const voosCriados = await vooServiceSpecific.getByAeronave(aeronave.id);
    console.log("Voos criados verificados:", voosCriados);
  } catch (error) {
    console.error("Erro ao fazer seed de voos:", error);
  }
}; 