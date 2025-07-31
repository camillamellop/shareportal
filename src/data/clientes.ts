export interface ClienteContato {
  nome?: string;
  telefone?: string;
  email?: string;
  cargo_responsabilidade?: string;
  nomes_associados?: string;
}

export interface SubEntidade {
  nome: string;
  contatos: ClienteContato[];
}

export interface Cliente {
  nome_cliente: string;
  identificador?: string;
  contatos: ClienteContato[];
  sub_entidades?: SubEntidade[];
  notas_pagamento?: string;
}

export const clientesData: Cliente[] = [
  {
    nome_cliente: "GA",
    identificador: "PT-OPC",
    contatos: [
      {
        nome: "Elaine",
        telefone: "41 98833-0030",
        cargo_responsabilidade: "Contato principal"
      },
      {
        email: "contasapagar@grupoaldo",
        cargo_responsabilidade: "Hangaragem e custos fixos"
      },
      {
        email: "luana.lira",
        cargo_responsabilidade: "Hangaragem e custos fixos"
      },
      {
        email: "elaine.santos",
        cargo_responsabilidade: "Manutenção, combustível e Hangaragens"
      },
      {
        email: "jefferson.meira@grupoaldo.com.br",
        cargo_responsabilidade: "Responsável pelo ok"
      },
      {
        email: "agendamento@grupoaldo.com.br",
        cargo_responsabilidade: "PAGAMENTOS URGÊNTES"
      },
      {
        email: "secretaria.aldo@grupoaldo.com.br",
        cargo_responsabilidade: "Secretária Aldo (Exceções)"
      }
    ],
    notas_pagamento: "A GA paga as QUARTAS"
  },
  {
    nome_cliente: "SANTUM",
    identificador: "PS-DMS",
    contatos: [
      {
        email: "Elisabete.jung@vidallogistica.com"
      },
      {
        nome: "Sandro.antunes"
      },
      {
        email: "liriane.ptn@vidallogistica.com"
      }
    ]
  },
  {
    nome_cliente: "SOLUÇÃO TÉCNICA",
    identificador: "PP-JCP",
    contatos: [
      {
        email: "gerentefinanceiro@solucaotecnica",
        nomes_associados: "Daniel e Neia"
      },
      {
        email: "financeiro@solucaotecnica"
      },
      {
        email: "jeniffer.dias@bretonmt.com.br"
      }
    ]
  },
  {
    nome_cliente: "ESTANCIA BAHIA",
    identificador: "PT-OPC",
    contatos: [
      {
        nome: "Alberto",
        telefone: "65 99944-1578"
      },
      {
        nome: "Helio",
        telefone: "66 99916-4712"
      },
      {
        nome: "Leopoldo",
        telefone: "65 99688-3627"
      },
      {
        nome: "Giovanna"
      },
      {
        nome: "Mauricio"
      },
      {
        nome: "Alberto"
      },
      {
        nome: "Hélio"
      },
      {
        nome: "Leopoldo"
      },
      {
        nome: "Adriana",
        email: "adriana@estanciabahia.com.br"
      },
      {
        nome: "Kênia",
        email: "kenia.jesus@estanciabahia.com.br"
      }
    ],
    notas_pagamento: "EBL paga as segundas e quintas"
  },
  {
    nome_cliente: "PT-TOR",
    contatos: [
      {
        email: "financeiro@brilhanteagro.com.br"
      },
      {
        email: "administrativo@brilhanteagro.com.br"
      },
      {
        email: "eugeniobergamin@hotmail.com",
        cargo_responsabilidade: "só em casos específicos"
      }
    ]
  },
  {
    nome_cliente: "PR-MDL",
    contatos: []
  },
  {
    nome_cliente: "WATT",
    contatos: [
      {
        nome: "Margarete",
        telefone: "65 99232-2356",
        cargo_responsabilidade: "Contato principal"
      },
      {
        email: "administrativo@wattbras",
        nomes_associados: "Margarete"
      },
      {
        email: "gerentecomercial"
      }
    ]
  },
  {
    nome_cliente: "CARVALIMA",
    contatos: [
      {
        nome: "Adriele",
        telefone: "65 99694-2441",
        cargo_responsabilidade: "Contato principal"
      },
      {
        email: "Adm.fedrizze",
        nomes_associados: "Adriele"
      }
    ]
  },
  {
    nome_cliente: "PT-JPK",
    sub_entidades: [
      {
        nome: "Hotel Sta Rosa",
        contatos: [
          {
            email: "financeiro@santarosapantanal.com.br"
          },
          {
            email: "bruno@gruporbr.com"
          },
          {
            email: "ivanil.santos@gruporbr.com"
          }
        ]
      },
      {
        nome: "Agro Ceolin",
        contatos: [
          {
            email: "agroceolin@gruporbr.com"
          }
        ]
      }
    ]
  }
]; 