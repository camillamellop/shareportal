import { abastecimentoService } from '@/services/abastecimentoService';
import { logger } from '@/utils/logger';

const dadosIniciais = [
  {
    acft: 'PR-MDL',
    cotista: 'João Silva',
    dataAbastecimento: '2024-08-01',
    abastecedor: 'Posto Aeroporto Congonhas',
    numeroComanda: 'COM001',
    litros: 500,
    valorUnitario: 6.67,
    total: 3337.50,
    numeroFiscal: 'NF001',
    numeroBoleto: 'BOL001',
    vencimento: '2024-08-15',
    email: true,
    rateio: false,
    observacoes: 'SBCY - SWJN 28/05'
  },
  {
    acft: 'PT-OPC',
    cotista: 'Maria Santos',
    dataAbastecimento: '2024-08-02',
    abastecedor: 'Posto Aeroporto Santos Dumont',
    numeroComanda: 'COM002',
    litros: 800,
    valorUnitario: 6.50,
    total: 5200.00,
    numeroFiscal: 'NF002',
    numeroBoleto: 'BOL002',
    vencimento: '2024-08-20',
    email: true,
    rateio: false,
    observacoes: 'SEM BOLETO'
  },
  {
    acft: 'PS-AVE',
    cotista: 'Carlos Oliveira',
    dataAbastecimento: '2024-08-03',
    abastecedor: 'Posto Aeroporto Guarulhos',
    numeroComanda: 'COM003',
    litros: 600,
    valorUnitario: 6.80,
    total: 4080.00,
    numeroFiscal: 'NF003',
    numeroBoleto: 'BOL003',
    vencimento: '2024-08-25',
    email: false,
    rateio: true,
    observacoes: 'SEM COMANDA E BOLETO'
  },
  {
    acft: 'PR-MDL',
    cotista: 'Ana Costa',
    dataAbastecimento: '2024-08-04',
    abastecedor: 'Posto Aeroporto Brasília',
    numeroComanda: 'COM004',
    litros: 450,
    valorUnitario: 6.75,
    total: 3037.50,
    numeroFiscal: 'NF004',
    numeroBoleto: 'BOL004',
    vencimento: '2024-08-30',
    email: true,
    rateio: false,
    observacoes: 'ABASTECIMENTO SEM COMA'
  },
  {
    acft: 'PT-OPC',
    cotista: 'Roberto Lima',
    dataAbastecimento: '2024-08-05',
    abastecedor: 'Posto Aeroporto Recife',
    numeroComanda: 'COM005',
    litros: 700,
    valorUnitario: 6.60,
    total: 4620.00,
    numeroFiscal: 'NF005',
    numeroBoleto: 'BOL005',
    vencimento: '2024-09-05',
    email: false,
    rateio: true,
    observacoes: 'SWJN - SBCY 20/07'
  },
  {
    acft: 'PS-AVE',
    cotista: 'Fernanda Rocha',
    dataAbastecimento: '2024-08-06',
    abastecedor: 'Posto Aeroporto Salvador',
    numeroComanda: 'COM006',
    litros: 550,
    valorUnitario: 6.70,
    total: 3685.00,
    numeroFiscal: 'NF006',
    numeroBoleto: 'BOL006',
    vencimento: '2024-09-10',
    email: true,
    rateio: false,
    observacoes: 'E-MAIL NÃO FOI ENVIADO, P'
  },
  {
    acft: 'PR-MDL',
    cotista: 'Pedro Almeida',
    dataAbastecimento: '2024-08-07',
    abastecedor: 'Posto Aeroporto Fortaleza',
    numeroComanda: 'COM007',
    litros: 650,
    valorUnitario: 6.55,
    total: 4257.50,
    numeroFiscal: 'NF007',
    numeroBoleto: 'BOL007',
    vencimento: '2024-09-15',
    email: true,
    rateio: false,
    observacoes: 'PAGO'
  },
  {
    acft: 'PT-OPC',
    cotista: 'Lucia Ferreira',
    dataAbastecimento: '2024-08-08',
    abastecedor: 'Posto Aeroporto Belo Horizonte',
    numeroComanda: 'COM008',
    litros: 750,
    valorUnitario: 6.45,
    total: 4837.50,
    numeroFiscal: 'NF008',
    numeroBoleto: 'BOL008',
    vencimento: '2024-09-20',
    email: true,
    rateio: false,
    observacoes: 'FOI ENVIADO UMA NOVA NO'
  },
  {
    acft: 'PS-AVE',
    cotista: 'Marcos Silva',
    dataAbastecimento: '2024-08-09',
    abastecedor: 'Posto Aeroporto Curitiba',
    numeroComanda: 'COM009',
    litros: 480,
    valorUnitario: 6.80,
    total: 3264.00,
    numeroFiscal: 'NF009',
    numeroBoleto: 'BOL009',
    vencimento: '2024-09-25',
    email: false,
    rateio: true,
    observacoes: 'SEM MAIS INFOS'
  },
  {
    acft: 'PR-MDL',
    cotista: 'Carla Santos',
    dataAbastecimento: '2024-08-10',
    abastecedor: 'Posto Aeroporto Porto Alegre',
    numeroComanda: 'COM010',
    litros: 520,
    valorUnitario: 6.72,
    total: 3494.40,
    numeroFiscal: 'NF010',
    numeroBoleto: 'BOL010',
    vencimento: '2024-09-30',
    email: true,
    rateio: false,
    observacoes: 'ABASTECIMENTO REGULAR'
  }
];

export async function executarSeedAbastecimento() {
  try {
    logger.info('Iniciando seed de dados de abastecimento...');
    
    let sucessos = 0;
    let erros = 0;
    
    for (const dados of dadosIniciais) {
      try {
        await abastecimentoService.create(dados);
        sucessos++;
        logger.debug('Abastecimento criado com sucesso', { acft: dados.acft, cotista: dados.cotista });
      } catch (error) {
        erros++;
        logger.error('Erro ao criar abastecimento', { error, dados });
      }
    }
    
    logger.info('Seed de abastecimento concluído', { 
      total: dadosIniciais.length, 
      sucessos, 
      erros 
    });
    
    return { sucessos, erros, total: dadosIniciais.length };
  } catch (error) {
    logger.error('Erro durante seed de abastecimento', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  // No browser, adicionar ao window para acesso via console
  (window as any).executarSeedAbastecimento = executarSeedAbastecimento;
}
