import { Timestamp } from "firebase/firestore";

export interface Despesa {
  categoria: string;
  descricao: string;
  valor: number;
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
}

export interface RelatorioViagem {
  id: string;
  cotista: string;
  aeronave: string;
  tripulante: string;
  destino: string;
  data_inicio: string;
  data_fim: string;
  despesas: Despesa[];
  total_combustivel: number;
  total_hospedagem: number;
  total_alimentacao: number;
  total_transporte: number;
  total_outros: number;
  total_tripulante: number;
  total_cotista: number;
  total_share_brasil: number;
  valor_total: number;
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Ressarcimento {
  id: string;
  relatorio_id: string;
  tipo: 'pagar' | 'cobrar';
  destinatario: string;
  valor: number;
  descricao: string;
  status: 'pendente' | 'pago' | 'cancelado';
  data_vencimento: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const CATEGORIAS_DESPESA = [
  "Combustível",
  "Hospedagem", 
  "Alimentação",
  "Transporte",
  "Outros"
] as const;

export const AERONAVES = [
  "PT-MDL",
  "PT-OPC", 
  "PT-TOR",
  "PS-AVE",
  "PT-RVJ",
  "PT-JPK",
  "PT-OJG",
  "PT-WSR",
  "PP-JCP"
] as const;

export const PAGADORES = [
  "Tripulante",
  "Cotista", 
  "Share Brasil"
] as const; 