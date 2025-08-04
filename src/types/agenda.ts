export interface Contact {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  empresa?: string;
  cargo?: string;
  categoria: 'clientes' | 'colaboradores' | 'fornecedores' | 'abastecimento' | 'hoteis';
  favorito: boolean;
  observacoes?: string;
  endereco?: string;
  cidade?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FuelStation {
  id: string;
  nome: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  combustiveis: string[];
  horario_funcionamento?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Hotel {
  id?: string;
  hotel: string;
  telefone: string;
  endereco?: string;
  cidade: string;
  preco_sgl: number;
  preco_dbl: number;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}