import { aeronaveService } from "@/services/firestore";

const aeronavesIniciais = [
  {
    matricula: "PT-WSR",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 4565.5, // Horas reais do diário
    status: "ativa" as const
  },
  {
    matricula: "PR-MDL",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 3299.7,
    status: "ativa" as const
  },
  {
    matricula: "PS-AVE",
    modelo: "182T",
    ano_diario: 2025,
    horas_totais: 2100.3,
    status: "ativa" as const
  },
  {
    matricula: "PT-OPC",
    modelo: "PAY2",
    ano_diario: 2025,
    horas_totais: 7086.1,
    status: "ativa" as const
  },
  {
    matricula: "PT-JPK",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 2156.3,
    status: "ativa" as const
  },
  {
    matricula: "PT-OJG",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 1897.8,
    status: "ativa" as const
  },
  {
    matricula: "PT-RVJ",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 3245.2,
    status: "ativa" as const
  },
  {
    matricula: "PT-TOR",
    modelo: "PA34220T",
    ano_diario: 2025,
    horas_totais: 1567.9,
    status: "ativa" as const
  }
];

export const seedAeronaves = async () => {
  try {
    console.log("Iniciando seed de aeronaves...");
    
    for (const aeronave of aeronavesIniciais) {
      console.log(`Criando aeronave: ${aeronave.matricula}`);
      const id = await aeronaveService.create(aeronave);
      console.log(`Aeronave ${aeronave.matricula} criada com ID: ${id}`);
    }
    
    console.log("Seed de aeronaves concluído!");
    
    // Verificar se foram criadas
    const aeronavesCriadas = await aeronaveService.getAll();
    console.log("Aeronaves criadas:", aeronavesCriadas);
  } catch (error) {
    console.error("Erro ao fazer seed de aeronaves:", error);
  }
}; 