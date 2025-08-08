import { hotelService } from "@/services/firestore";

export const hotelsData = [
  {
    cidade: "AGUA BOA",
    hotel: "PLAZA HOTEL",
    preco_sgl: 190.00,
    preco_dbl: 310.00,
    telefone: "(66) 99621-4002 OU 3468-1364",
    endereco: "R. Três, 292 - Centro, Água Boa - MT, 78635-000"
  },
  {
    cidade: "AGUA BOA",
    hotel: "HOTEL LIDER",
    preco_sgl: 140.00,
    preco_dbl: 190.00,
    telefone: "(66) 9229-0148",
    endereco: "R. Dez - Centro, Água Boa - MT, 78635-000"
  },
  {
    cidade: "BALSAS",
    hotel: "NEW PLAZA HOTEL",
    preco_sgl: 210.00,
    preco_dbl: 220.00,
    telefone: "(99) 98112-1274",
    endereco: "Av. Dr. José Bernadino, Nº 69 - Centro, Balsas - MA, 65800-000"
  },
  {
    cidade: "BALSAS",
    hotel: "HOTEL RIOS",
    preco_sgl: 220.00,
    preco_dbl: 280.00,
    telefone: "(99) 98528-9383",
    endereco: "Av. Gov. Luiz Rocha, N° 216 - Potosi, Balsas - MA, 65800-000"
  },
  {
    cidade: "CAMPO NOVO DO PARECIS",
    hotel: "DALLAS PALACE HOTEL",
    preco_sgl: 199.00,
    preco_dbl: 289.00,
    telefone: "(65) 3382-1385",
    endereco: "Av. Brasil 85-Centro - Campo Novo do Parecis - MT, 78360-000"
  },
  {
    cidade: "CAMPO NOVO DO PARECIS",
    hotel: "CNP BRASIL",
    preco_sgl: 165.00,
    preco_dbl: 220.00,
    telefone: "(65) 3382-6732",
    endereco: "Av. Brasil, 115 - Centro, Campo Novo do Parecis - MT, 78360-000"
  },
  {
    cidade: "CONFRESA",
    hotel: "HOTEL REAL",
    preco_sgl: 150.00,
    preco_dbl: 200.00,
    telefone: "(66) 98404-8631 OU 3564-1185",
    endereco: "Av. Airton Senna, 34, Centro - Confresa - MT, 78652-000"
  },
  {
    cidade: "CONFRESA",
    hotel: "TROPICAL",
    preco_sgl: 160.00,
    preco_dbl: 280.00,
    telefone: "(66) 98448-8648",
    endereco: "Av. Brasil, 627 - Jardim do Éden, Confresa - MT, 78652-000"
  },
  {
    cidade: "ERECHIM",
    hotel: "VIVENDAS",
    preco_sgl: 150.00,
    preco_dbl: 265.00,
    telefone: "(54) 3522-4100",
    endereco: "Av. Caldas Júnior, 1740 - Bela Vista, Erechim - RS, 99714-050"
  },
  {
    cidade: "ERECHIM",
    hotel: "IBIS ERECHIM",
    preco_sgl: 258.00,
    preco_dbl: 310.00,
    telefone: "(54) 2112-0443",
    endereco: "R. Carlos Demarchi, 71 - Fátima, Erechim - RS, 99709-282"
  },
  {
    cidade: "GOIANIA",
    hotel: "SANTOS DUMONT",
    preco_sgl: 220.00,
    preco_dbl: 318.00,
    telefone: "(62) 99248-2734",
    endereco: "Av. Santos Dumont, 1001 - Santa Genoveva, Goiânia - GO, 74672-420"
  },
  {
    cidade: "GOIANIA",
    hotel: "IBIS GOIANIA",
    preco_sgl: 300.00,
    preco_dbl: 350.00,
    telefone: "(62) 2765-8050",
    endereco: "R. 21, 154 - St. Oeste, Goiânia - GO, 74120-120"
  },
  {
    cidade: "GUARANTÃ",
    hotel: "ESPLANADA",
    preco_sgl: 140.00,
    preco_dbl: 240.00,
    telefone: "(66) 9688-9689",
    endereco: "R. Pioneiro Genésio Metto, 333 - Centro, Guarantã do Norte - MT, 78520-000"
  },
  {
    cidade: "GUARANTÃ",
    hotel: "SEDNA PALACE",
    preco_sgl: 212.00,
    preco_dbl: 292.00,
    telefone: "(66) 3552-2500",
    endereco: "Av. Pioneiro Joso Nelson Coutinho, 875 - Centro, Guarantã do Norte - MT, 78520-000"
  },
  {
    cidade: "LUCAS DO RIO VERDE",
    hotel: "TRANSAMERICA LUCAS",
    preco_sgl: 260.00,
    preco_dbl: 310.00,
    telefone: "(65) 99693-6888",
    endereco: "Av. das Acácias, 2429W - Parque das Emas, Lucas do Rio Verde - MT, 78455-000"
  },
  {
    cidade: "LUCAS DO RIO VERDE",
    hotel: "HOTEL ÁGUAS VERDES",
    preco_sgl: 150.00,
    preco_dbl: 310.00,
    telefone: "(65) 99988-5199",
    endereco: "R. São Lourenço do Oeste, 1391 - 1391 - S - S. Alvorada, Lucas do Rio Verde - MT, 78455-000"
  },
  {
    cidade: "MATUPA",
    hotel: "HOTEL AVENIDA",
    preco_sgl: 145.00,
    preco_dbl: 155.00,
    telefone: "(66) 3595-2275",
    endereco: "R. 2, 3801 - ZC1-002, Matupá - MT, 78525-000"
  },
  {
    cidade: "MINEIROS - GO",
    hotel: "PLAZA HOTEL",
    preco_sgl: 160.00,
    preco_dbl: 240.00,
    telefone: "(64) 3660-2663",
    endereco: "BR-364 - Zona Rural, Mineiros - GO, 75830-000"
  },
  {
    cidade: "MINEIROS - GO",
    hotel: "PILÕES PALACE HOTEL",
    preco_sgl: 270.00,
    preco_dbl: 330.00,
    telefone: "(64) 3661-1547",
    endereco: "Rua 13, 13 Setor Centro e Oeste - Centro, Mineiros - GO, 75830-974"
  },
  {
    cidade: "PORTO VELHO",
    hotel: "FLAMBOYANT",
    preco_sgl: 210.00,
    preco_dbl: 275.00,
    telefone: "(69) 3225-2102",
    endereco: "Av. Tiradentes, 2879 - Industrial, Porto Velho - RO, 76821-001"
  },
  {
    cidade: "PORTO VELHO",
    hotel: "ECOS CLASSIC",
    preco_sgl: 147.35,
    preco_dbl: 166.89,
    telefone: "(69) 2181-5481",
    endereco: "Rua Paulo Leal, 611, Centro, 76804-106 Porto Velho, RO"
  },
  {
    cidade: "PRIMAVERA DO LESTE",
    hotel: "BATISTELA HOTEL",
    preco_sgl: 220.00,
    preco_dbl: 350.00,
    telefone: "(66) 99939-1085",
    endereco: "Av. Campo Grande, 925 - Jardim Riva, Primavera do Leste - MT, 78850-000"
  },
  {
    cidade: "PRIMAVERA DO LESTE",
    hotel: "BRAVO CITY",
    preco_sgl: 208.00,
    preco_dbl: 259.00,
    telefone: "(66) 3498-1799",
    endereco: "Av. São Paulo, 350 - Jardim Riva, Primavera do Leste - MT, 78850-000"
  },
  {
    cidade: "PRIMAVERA DO LESTE",
    hotel: "BIANCH",
    preco_sgl: 180.00,
    preco_dbl: 270.00,
    telefone: "(66) 3498-1862",
    endereco: "Av. São João, 785 - Centro - Primavera do Leste - MT"
  },
  {
    cidade: "PRIMAVERA DO LESTE",
    hotel: "BARRIL",
    preco_sgl: 249.00,
    preco_dbl: 298.00,
    telefone: "(66) 3498-1247",
    endereco: "Av. Cuiabá, 333 - Centro, Primavera do Leste - MT, 78850-000"
  },
  {
    cidade: "RIO VERDE - GO",
    hotel: "LIBERTÉ PALACE HOTEL",
    preco_sgl: 160.00,
    preco_dbl: 250.00,
    telefone: "(64) 9613-2807",
    endereco: "Perímetro Urbano 308, BR-060, Rio Verde - GO, 75904-900"
  },
  {
    cidade: "RIO VERDE - GO",
    hotel: "VITÓRIA RÉGIA",
    preco_sgl: 215.00,
    preco_dbl: 315.00,
    telefone: "(64) 3611-4100",
    endereco: "R. Rosulino Ferreira Guimarães, 621 - Centro, Rio Verde - GO, 75901-265"
  },
  {
    cidade: "RONDONÓPOLIS",
    hotel: "TRANSAMERICA RONDONÓPOLIS",
    preco_sgl: 241.50,
    preco_dbl: 267.75,
    telefone: "(66) 99282-6835",
    endereco: "Av. Lions Internacional, 1235 - Vila Aurora I, Rondonópolis - MT, 78740-046"
  },
  {
    cidade: "RONDONÓPOLIS",
    hotel: "PIRATININGA",
    preco_sgl: 200.00,
    preco_dbl: 250.00,
    telefone: "(66) 3411-5800",
    endereco: "R. Fernando Corrêa da Costa, 621 - Centro, Rondonópolis"
  },
  {
    cidade: "SÃO PAULO",
    hotel: "HOLIDAY INN ANHEMBI",
    preco_sgl: 367.00,
    preco_dbl: 380.00,
    telefone: "(11) 2107-8844",
    endereco: "Rua Professor Milton Rodriguez 100 - Parque Anhembi, São Paulo - SP, 02009-040"
  },
  {
    cidade: "SÃO PAULO",
    hotel: "IBIS H.N",
    preco_sgl: 208.00,
    preco_dbl: 224.00,
    telefone: "(11) 94802-9412",
    endereco: "R. Cel. Antônio de Carvalho, 209 - Santana, São Paulo - SP, 02032-030"
  },
  {
    cidade: "SORRISO",
    hotel: "HOTEL ANA DALIA",
    preco_sgl: 206.00,
    preco_dbl: 275.00,
    telefone: "(66) 99726-8950",
    endereco: "Av. Luiz Amadeu Lodi, 1395 - Bom Jesus, Sorriso - MT, 78896-130"
  },
  {
    cidade: "SORRISO",
    hotel: "COMERCIAL FIT TRANSAMERICA",
    preco_sgl: 280.00,
    preco_dbl: 310.00,
    telefone: "(66) 3545-2900",
    endereco: "Av. Blumenau, 2265 - Bela Vista, Sorriso - MT, 78890-001"
  },
  {
    cidade: "SORRISO",
    hotel: "HOTEL IMPERIAL PALACE",
    preco_sgl: 295.00,
    preco_dbl: 350.00,
    telefone: "(66) 99604-5101",
    endereco: "Av. Perimetral Sudeste, 8675, Sorriso - MT, 78890-000"
  },
  {
    cidade: "RIO VERDE - GO",
    hotel: "HOTEL ACAPU",
    preco_sgl: 185.00,
    preco_dbl: 295.00,
    telefone: "(64) 3612-1098",
    endereco: "Rua Demolinho de Carvalho, Quadra 01 Lotes 8 ao 15 - Jardim Brasília, Rio Verde - GO, 75906-275"
  }
];

export const seedHotels = async () => {
  try {
    console.log("Iniciando seed de hotéis...");
    
    // Limpar dados existentes
    const existingHotels = await hotelService.getAll();
    for (const hotel of existingHotels) {
      await hotelService.delete(hotel.id);
    }
    console.log("Dados existentes de hotéis removidos");
    
    // Adicionar novos dados
    for (const hotelData of hotelsData) {
      const hotelId = await hotelService.create({
        ...hotelData,
      });
      console.log(`Hotel criado: ${hotelData.hotel} (ID: ${hotelId})`);
    }
    
    console.log(`Seed de hotéis concluído! ${hotelsData.length} hotéis adicionados.`);
  } catch (error) {
    console.error("Erro ao executar seed de hotéis:", error);
    throw error;
  }
}; 