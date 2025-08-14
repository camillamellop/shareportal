import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { auth } from "@/integrations/firebase/config";

// Tipos básicos
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin'; // Regras do Firebase
  cargo?: string; // Cargo na empresa
  cpf?: string;
  telefone?: string;
  dataNascimento?: string; // formato: "YYYY-MM-DD"
  photoURL?: string;
  photoPath?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  sender: string;
  recipients: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  readAt?: Timestamp;
}

export interface Aeronave {
  id: string;
  matricula: string;
  modelo: string;
  ano_diario: number;
  horas_totais: number;
  status: "ativa" | "inativa" | "manutencao";
  consumo_medio?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Voo {
  id: string;
  data: string;
  hora_partida: string;
  hora_chegada: string;
  origem: string;
  destino: string;
  piloto: string;
  copiloto?: string;
  cotista: string;
  horas_voo: number;
  combustivel_inicial: number;
  combustivel_final: number;
  observacoes?: string;
  pic_anac?: string;
  sic_anac?: string;
  voo_para?: string;
  confere?: string;
  aeronave_id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contact {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  empresa?: string;
  cargo?: string;
  categoria: "clientes" | "fornecedores" | "colaboradores" | "outros";
  favorito: boolean;
  observacoes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FuelStation {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  cidade: string;
  combustiveis: string[];
  horario_funcionamento: string;
  observacoes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Hotel {
  id: string;
  hotel: string;
  telefone: string;
  endereco: string;
  cidade: string;
  preco_sgl: number;
  preco_dbl: number;
  observacoes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Birthday {
  id: string;
  nome: string;
  data_aniversario: string; // formato: "DD/MM/YYYY"
  empresa?: string; // Adicionado campo empresa
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Cliente {
  id: string;
  nome_cliente: string;
  identificador?: string;
  contato: ClienteContato;
  notas_pagamento?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClienteContato {
  nome?: string;
  telefone?: string;
  email?: string;
  cargo_responsabilidade?: string;
  nomes_associados?: string;
}

export interface Abastecimento {
  id: string;
  icai: string;
  cidade: string;
  setor?: string;
  contato?: string;
  telefone: string;
  email?: string;
  observacao?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SolicitacaoCompra {
  id: string;
  produto: string;
  quantidade: string;
  valor: number;
  data_solicitacao: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  solicitante: string;
  observacoes?: string;
  aprovador?: string;
  data_aprovacao?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Despesa {
  data: any;
  categoria: string;
  descricao: string;
  valor: number;
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
}

export interface RelatorioViagem {
  numero: string;
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

export interface ValeBeneficio {
  id: string;
  tipo: 'alimentacao' | 'combustivel';
  mes: string; // formato: "YYYY-MM"
  saldoInicial: number;
  saldoDisponivel: number;
  despesas: ValeDespesa[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ValeDespesa {
  id: string;
  nome: string;
  valor: number;
  descricao: string;
  categoria: string;
  data: string; // formato: "YYYY-MM-DD"
  createdAt: Timestamp;
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

// Serviço genérico para CRUD
export class FirestoreService<T> {
  constructor(private collectionName: string) {}

  // Buscar todos os documentos
  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  // Buscar documento por ID
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    }
    return null;
  }

  // Criar novo documento
  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  // Atualizar documento
  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }

  // Deletar documento
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  // Buscar com filtros
  async query(filters: { field: string; operator: any; value: any }[] = []): Promise<T[]> {
    let q = collection(db, this.collectionName);
    
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }
}

// Instâncias dos serviços
export const userService = new FirestoreService<User>('users');
export const taskService = new FirestoreService<Task>('tasks');
export const messageService = new FirestoreService<Message>('messages');
export const aeronaveService = new FirestoreService<Aeronave>('aeronaves');
export const vooService = new FirestoreService<Voo>('voos');
export const clienteService = new FirestoreService<Cliente>('clientes');
export const contactService = new FirestoreService<Contact>('contacts');
export const fuelStationService = new FirestoreService<FuelStation>('fuelStations');
export const hotelService = new FirestoreService<Hotel>('hotels');
export const birthdayService = new FirestoreService<Birthday>('birthdays');
export const abastecimentoService = new FirestoreService<Abastecimento>('abastecimento');
export const relatorioViagemService = new FirestoreService<RelatorioViagem>('relatorios_viagem');
export const ressarcimentoService = new FirestoreService<Ressarcimento>('ressarcimentos');
export const solicitacaoCompraService = new FirestoreService<SolicitacaoCompra>('solicitacoes_compras');

// Funções específicas para cada entidade
export const userServiceSpecific = {
  ...userService,
  
  // Buscar usuário atual
  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    return userService.getById(user.uid);
  },
  
  // Criar ou atualizar usuário atual
  async createOrUpdateCurrentUser(userData: Partial<User>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    
    const existingUser = await userService.getById(user.uid);
    
    if (existingUser) {
      await userService.update(user.uid, userData);
    } else {
      await userService.create({
        id: user.uid,
        name: userData.name || user.displayName || "Usuário",
        email: userData.email || user.email || "",
        role: userData.role || "user",
        dataNascimento: userData.dataNascimento,
        photoURL: userData.photoURL,
        photoPath: userData.photoPath,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      } as User);
    }
  },
  
  // Atualizar foto do perfil
  async updateProfilePhoto(photoURL: string, photoPath: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    
    await userService.update(user.uid, {
      photoURL,
      photoPath
    } as Partial<User>);
  },

  // Atualizar perfil do usuário atual
  async updateCurrentUserProfile(userData: Partial<User>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    
    await userService.update(user.uid, {
      ...userData,
      updatedAt: Timestamp.now()
    } as Partial<User>);
  }
};

export const aeronaveServiceSpecific = {
  ...aeronaveService,
  
  // Buscar aeronaves ativas
  async getAtivas(): Promise<Aeronave[]> {
    return aeronaveService.query([{ field: 'status', operator: '==', value: 'ativa' }]);
  },
  
  // Buscar aeronave por matrícula
  async getByMatricula(matricula: string): Promise<Aeronave | null> {
    console.log("getByMatricula chamado com:", matricula);
    const aeronaves = await aeronaveService.query([{ field: 'matricula', operator: '==', value: matricula }]);
    console.log("Resultado da query:", aeronaves);
    return aeronaves.length > 0 ? aeronaves[0] : null;
  },
  
  // Atualizar horas totais
  async updateHorasTotais(id: string, novasHoras: number): Promise<void> {
    await aeronaveService.update(id, {
      horas_totais: novasHoras
    } as Partial<Aeronave>);
  }
};

export const vooServiceSpecific = {
  // Métodos herdados do vooService
  getAll: vooService.getAll.bind(vooService),
  getById: vooService.getById.bind(vooService),
  create: vooService.create.bind(vooService),
  update: vooService.update.bind(vooService),
  delete: vooService.delete.bind(vooService),
  query: vooService.query.bind(vooService),
  
  // Buscar voos por aeronave
  async getByAeronave(aeronaveId: string): Promise<Voo[]> {
    console.log("getByAeronave chamado com aeronaveId:", aeronaveId);
    try {
      const voos = await vooService.query([{ field: 'aeronave_id', operator: '==', value: aeronaveId }]);
      console.log("Resultado da query getByAeronave:", voos);
      return voos;
    } catch (error) {
      console.error("Erro na query getByAeronave (índice necessário):", error);
      // Retornar lista vazia temporariamente
      return [];
    }
  },
  
  // Buscar voos por data
  async getByData(data: string): Promise<Voo[]> {
    return vooService.query([{ field: 'data', operator: '==', value: data }]);
  },
  
  // Buscar voos por piloto
  async getByPiloto(picAnac: string): Promise<Voo[]> {
    return vooService.query([{ field: 'pic_anac', operator: '==', value: picAnac }]);
  },
  
  // Buscar voos por período
  async getByPeriodo(dataInicio: string, dataFim: string): Promise<Voo[]> {
    return vooService.query([
      { field: 'data', operator: '>=', value: dataInicio },
      { field: 'data', operator: '<=', value: dataFim }
    ]);
  }
};

export const taskServiceSpecific = {
  // Métodos herdados do taskService
  getAll: taskService.getAll.bind(taskService),
  getById: taskService.getById.bind(taskService),
  create: taskService.create.bind(taskService),
  update: taskService.update.bind(taskService),
  delete: taskService.delete.bind(taskService),
  query: taskService.query.bind(taskService),
  
  // Buscar tarefas por usuário
  async getByUser(userId: string): Promise<Task[]> {
    return taskService.query([{ field: 'assignedTo', operator: '==', value: userId }]);
  },
  
  // Buscar tarefas por status
  async getByStatus(status: Task['status']): Promise<Task[]> {
    return taskService.query([{ field: 'status', operator: '==', value: status }]);
  },
  
  // Buscar tarefas pendentes
  async getPending(): Promise<Task[]> {
    return taskService.query([{ field: 'status', operator: '==', value: 'pending' }]);
  }
};

export const messageServiceSpecific = {
  // Métodos herdados do messageService
  getAll: messageService.getAll.bind(messageService),
  getById: messageService.getById.bind(messageService),
  create: messageService.create.bind(messageService),
  update: messageService.update.bind(messageService),
  delete: messageService.delete.bind(messageService),
  query: messageService.query.bind(messageService),
  
  // Buscar mensagens por destinatário
  async getByRecipient(userId: string): Promise<Message[]> {
    return messageService.query([{ field: 'recipients', operator: 'array-contains', value: userId }]);
  },
  
  // Buscar mensagens não lidas
  async getUnread(userId: string): Promise<Message[]> {
    return messageService.query([
      { field: 'recipients', operator: 'array-contains', value: userId },
      { field: 'readAt', operator: '==', value: null }
    ]);
  }
}; 

export const birthdayServiceSpecific = {
  ...birthdayService,
  
  // Buscar aniversários do mês atual
  async getByMonth(month: number): Promise<Birthday[]> {
    const allBirthdays = await birthdayService.getAll();
    return allBirthdays.filter(birthday => {
      const [day, monthStr] = birthday.data_aniversario.split('/');
      return parseInt(monthStr) === month;
    });
  },
  
  // Buscar aniversários por empresa
  async getByCompany(empresa: string): Promise<Birthday[]> {
    const allBirthdays = await birthdayService.getAll();
    return allBirthdays.filter(birthday => birthday.empresa === empresa);
  },
  
  // Buscar colaboradores (sem empresa)
  async getColaboradores(): Promise<Birthday[]> {
    const allBirthdays = await birthdayService.getAll();
    return allBirthdays.filter(birthday => !birthday.empresa);
  },
  
  // Buscar clientes (com empresa)
  async getClientes(): Promise<Birthday[]> {
    const allBirthdays = await birthdayService.getAll();
    return allBirthdays.filter(birthday => birthday.empresa);
  },
  
  // Buscar próximos aniversários (próximos 30 dias)
  async getUpcoming(): Promise<Birthday[]> {
    const allBirthdays = await birthdayService.getAll();
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    return allBirthdays.filter(birthday => {
      const [day, monthStr] = birthday.data_aniversario.split('/');
      const birthdayDate = new Date(today.getFullYear(), parseInt(monthStr) - 1, parseInt(day));
      
      // Se o aniversário já passou este ano, verificar para o próximo ano
      if (birthdayDate < today) {
        birthdayDate.setFullYear(today.getFullYear() + 1);
      }
      
      return birthdayDate <= nextMonth;
    });
  }
};

export const contactServiceSpecific = {
  ...contactService,
  
  // Buscar contatos por categoria
  async getByCategory(category: Contact['categoria']): Promise<Contact[]> {
    return contactService.query([{ field: 'categoria', operator: '==', value: category }]);
  },
  
  // Buscar contatos favoritos
  async getFavorites(): Promise<Contact[]> {
    return contactService.query([{ field: 'favorito', operator: '==', value: true }]);
  },
  
  // Buscar contatos por empresa
  async getByCompany(empresa: string): Promise<Contact[]> {
    return contactService.query([{ field: 'empresa', operator: '==', value: empresa }]);
  }
};

export const fuelStationServiceSpecific = {
  ...fuelStationService,
  
  // Buscar postos por cidade
  async getByCity(cidade: string): Promise<FuelStation[]> {
    return fuelStationService.query([{ field: 'cidade', operator: '==', value: cidade }]);
  },
  
  // Buscar postos por combustível
  async getByFuel(combustivel: string): Promise<FuelStation[]> {
    return fuelStationService.query([{ field: 'combustiveis', operator: 'array-contains', value: combustivel }]);
  }
};

export const hotelServiceSpecific = {
  ...hotelService,
  
  // Buscar hotéis por cidade
  async getByCity(cidade: string): Promise<Hotel[]> {
    return hotelService.query([{ field: 'cidade', operator: '==', value: cidade }]);
  },
  
  // Buscar hotéis por faixa de preço
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<Hotel[]> {
    return hotelService.query([
      { field: 'preco_sgl', operator: '>=', value: minPrice },
      { field: 'preco_sgl', operator: '<=', value: maxPrice }
    ]);
  }
};

export const relatorioViagemServiceSpecific = {
  ...relatorioViagemService,
  
  // Buscar relatórios por tripulante
  async getByTripulante(tripulante: string): Promise<RelatorioViagem[]> {
    return relatorioViagemService.query([{ field: 'tripulante', operator: '==', value: tripulante }]);
  },
  
  // Buscar relatórios por cotista
  async getByCotista(cotista: string): Promise<RelatorioViagem[]> {
    return relatorioViagemService.query([{ field: 'cotista', operator: '==', value: cotista }]);
  },
  
  // Buscar relatórios por aeronave
  async getByAeronave(aeronave: string): Promise<RelatorioViagem[]> {
    return relatorioViagemService.query([{ field: 'aeronave', operator: '==', value: aeronave }]);
  },
  
  // Buscar relatórios por status
  async getByStatus(status: RelatorioViagem['status']): Promise<RelatorioViagem[]> {
    return relatorioViagemService.query([{ field: 'status', operator: '==', value: status }]);
  },
  
  // Buscar relatórios pendentes
  async getPendentes(): Promise<RelatorioViagem[]> {
    return relatorioViagemService.query([{ field: 'status', operator: '==', value: 'pendente' }]);
  }
};

export const ressarcimentoServiceSpecific = {
  ...ressarcimentoService,
  
  // Buscar ressarcimentos por relatório
  async getByRelatorio(relatorioId: string): Promise<Ressarcimento[]> {
    return ressarcimentoService.query([{ field: 'relatorio_id', operator: '==', value: relatorioId }]);
  },
  
  // Buscar ressarcimentos por tipo
  async getByTipo(tipo: 'pagar' | 'cobrar'): Promise<Ressarcimento[]> {
    return ressarcimentoService.query([{ field: 'tipo', operator: '==', value: tipo }]);
  },
  
  // Buscar ressarcimentos por status
  async getByStatus(status: Ressarcimento['status']): Promise<Ressarcimento[]> {
    return ressarcimentoService.query([{ field: 'status', operator: '==', value: status }]);
  },
  
  // Buscar ressarcimentos pendentes
  async getPendentes(): Promise<Ressarcimento[]> {
    return ressarcimentoService.query([{ field: 'status', operator: '==', value: 'pendente' }]);
  },
  
  // Criar ressarcimentos automaticamente
  async criarRessarcimentos(relatorioId: string, totalTripulante: number, totalCotista: number): Promise<void> {
    const ressarcimentos = [];
    
    // Se o tripulante pagou algo, criar ressarcimento a pagar
    if (totalTripulante > 0) {
      ressarcimentos.push({
        relatorio_id: relatorioId,
        tipo: 'pagar' as const,
        destinatario: 'Tripulante',
        valor: totalTripulante,
        descricao: `Ressarcimento de despesas da viagem - Relatório ${relatorioId}`,
        status: 'pendente' as const,
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    // Se o cotista pagou algo, criar ressarcimento a cobrar
    if (totalCotista > 0) {
      ressarcimentos.push({
        relatorio_id: relatorioId,
        tipo: 'cobrar' as const,
        destinatario: 'Cotista',
        valor: totalCotista,
        descricao: `Cobrança de despesas da viagem - Relatório ${relatorioId}`,
        status: 'pendente' as const,
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    // Criar todos os ressarcimentos
    for (const ressarcimento of ressarcimentos) {
      await ressarcimentoService.create(ressarcimento);
    }
  }
}; 

// Serviços para Solicitações de Compras
export const solicitacaoCompraServiceSpecific = {
  ...solicitacaoCompraService,
  
  // Buscar por status
  async getByStatus(status: SolicitacaoCompra['status']): Promise<SolicitacaoCompra[]> {
    return solicitacaoCompraService.query([{ field: 'status', operator: '==', value: status }]);
  },
  
  // Buscar por solicitante
  async getBySolicitante(solicitante: string): Promise<SolicitacaoCompra[]> {
    return solicitacaoCompraService.query([{ field: 'solicitante', operator: '==', value: solicitante }]);
  },
  
  // Buscar pendentes
  async getPendentes(): Promise<SolicitacaoCompra[]> {
    return solicitacaoCompraService.query([{ field: 'status', operator: '==', value: 'pendente' }]);
  },
  
  // Aprovar solicitação
  async aprovarSolicitacao(id: string, aprovador: string): Promise<void> {
    await solicitacaoCompraService.update(id, {
      status: 'aprovada',
      aprovador,
      data_aprovacao: new Date().toISOString(),
      updatedAt: Timestamp.now()
    });
  },
  
  // Rejeitar solicitação
  async rejeitarSolicitacao(id: string, aprovador: string): Promise<void> {
    await solicitacaoCompraService.update(id, {
      status: 'rejeitada',
      aprovador,
      data_aprovacao: new Date().toISOString(),
      updatedAt: Timestamp.now()
    });
  },
  
  // Limpar todas as solicitações (apenas para desenvolvimento)
  async limparTodas(): Promise<void> {
    const todas = await solicitacaoCompraService.getAll();
    for (const solicitacao of todas) {
      await solicitacaoCompraService.delete(solicitacao.id);
    }
  }
};