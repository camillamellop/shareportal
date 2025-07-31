import { birthdayService } from "@/services/firestore";

const aniversariosColaboradores = [
  {
    nome: "ROLFFE ERBE",
    data_aniversario: "04/01/1986"
  },
  {
    nome: "CAMILA MELO",
    data_aniversario: "09/01/1993"
  },
  {
    nome: "WENDELL",
    data_aniversario: "14/02/1988"
  },
  {
    nome: "AUGUSTO",
    data_aniversario: "20/03/1991"
  },
  {
    nome: "KAROLINE JARDIM",
    data_aniversario: "21/04/2003"
  },
  {
    nome: "GUSTAVO NASCIMENTO",
    data_aniversario: "12/06/2005"
  },
  {
    nome: "RODRIGO TOSCANO",
    data_aniversario: "30/07/1981"
  },
  {
    nome: "ELISANGELA",
    data_aniversario: "02/08/XXXX"
  },
  {
    nome: "ANDRÉ LOPES",
    data_aniversario: "22/08/1974"
  },
  {
    nome: "ALINE",
    data_aniversario: "11/10/2000"
  },
  {
    nome: "DANIELE FOGGIATO",
    data_aniversario: "01/12/1998"
  }
];

const aniversariosClientes = [
  {
    nome: "FÁBIO FRANCISCO",
    data_aniversario: "02/01/1987",
    empresa: "WATT"
  },
  {
    nome: "APARÍCIO GUILHERME",
    data_aniversario: "06/01/1984",
    empresa: "GRF"
  },
  {
    nome: "OTAVIO FEDRIZZE",
    data_aniversario: "14/01/1987",
    empresa: "CARVALIMA"
  },
  {
    nome: "SEBASTIÃO FERREIRA",
    data_aniversario: "20/01/1951",
    empresa: "GRF"
  },
  {
    nome: "GABRIEL FEDRIZZE",
    data_aniversario: "28/01/1990",
    empresa: "CARVALIMA"
  },
  {
    nome: "RODRIGO",
    data_aniversario: "04/02/1987",
    empresa: "AGRO CEOLIN"
  },
  {
    nome: "LISENE BERGAMIM",
    data_aniversario: "26/02/1993",
    empresa: "BRILHANTE"
  },
  {
    nome: "GEOVANA - E. TBH",
    data_aniversario: "01/03/2000",
    empresa: "PT-OPC"
  },
  {
    nome: "DALGIRO",
    data_aniversario: "04/03/1960",
    empresa: "PT-JPK"
  },
  {
    nome: "ALDO LOCATELLI",
    data_aniversario: "17/03/1951",
    empresa: "GA SERVICE"
  },
  {
    nome: "DIOGO REIS",
    data_aniversario: "22/03/XXXX",
    empresa: "GRF"
  },
  {
    nome: "DIALMO FREDRIZZE",
    data_aniversario: "25/03/1958",
    empresa: "CARVALIMA"
  },
  {
    nome: "JANE - E.TBH",
    data_aniversario: "15/04/1968",
    empresa: "PT-OPC"
  },
  {
    nome: "MAURICIO NETO E.TBH",
    data_aniversario: "07/05/2019",
    empresa: "ESTÂNCIA B."
  },
  {
    nome: "MARINA FEDRIZZE",
    data_aniversario: "14/05/1960",
    empresa: "CARVALIMA"
  },
  {
    nome: "HANNIHE BERGAMIM",
    data_aniversario: "23/05/1996",
    empresa: "BRILHANTE"
  },
  {
    nome: "LUAN (Esposo Gabriela)",
    data_aniversario: "06/06/1995",
    empresa: "PT - OPC"
  },
  {
    nome: "JOANA E. TBH",
    data_aniversario: "08/06/2020",
    empresa: "PT - OPC"
  },
  {
    nome: "DANIEL LOCATELLI",
    data_aniversario: "10/06/1978",
    empresa: "WATT"
  },
  {
    nome: "LISANE BERGAMIN",
    data_aniversario: "29/06/1967",
    empresa: "BRILHANTE"
  },
  {
    nome: "BEATRIZ E. TBH",
    data_aniversario: "30/06/2013",
    empresa: "PT - OPC"
  },
  {
    nome: "MAURÍCIO TONHA",
    data_aniversario: "17/08/1962",
    empresa: "ESTÂNCIA B."
  },
  {
    nome: "EUGENIO BERGAMIM",
    data_aniversario: "21/09/1991",
    empresa: "BRILHANTE"
  },
  {
    nome: "BRUNO",
    data_aniversario: "21/09/1982",
    empresa: "SANTA ROSA"
  },
  {
    nome: "SANDRO ANTUNES",
    data_aniversario: "25/10/1982",
    empresa: "SANTUN"
  },
  {
    nome: "GUILHERME",
    data_aniversario: "22/11/1986",
    empresa: "ESTÂNCIA B."
  },
  {
    nome: "RAFAEL",
    data_aniversario: "01/12/1989",
    empresa: "PT-JPK"
  },
  {
    nome: "GABRIELA",
    data_aniversario: "14/12/1989",
    empresa: "ESTÂNCIA B."
  }
];

export const seedBirthdays = async () => {
  try {
    console.log("Iniciando seed de aniversários...");
    
    // Criar aniversários dos colaboradores
    console.log("Criando aniversários dos colaboradores...");
    for (const aniversario of aniversariosColaboradores) {
      console.log(`Criando aniversário: ${aniversario.nome}`);
      const id = await birthdayService.create(aniversario);
      console.log(`Aniversário ${aniversario.nome} criado com ID: ${id}`);
    }
    
    // Criar aniversários dos clientes
    console.log("Criando aniversários dos clientes...");
    for (const aniversario of aniversariosClientes) {
      console.log(`Criando aniversário: ${aniversario.nome} (${aniversario.empresa})`);
      const id = await birthdayService.create(aniversario);
      console.log(`Aniversário ${aniversario.nome} criado com ID: ${id}`);
    }
    
    console.log("Seed de aniversários concluído!");
    
    // Verificar se foram criados
    const aniversariosCriados = await birthdayService.getAll();
    console.log("Aniversários criados:", aniversariosCriados);
  } catch (error) {
    console.error("Erro ao fazer seed de aniversários:", error);
  }
}; 