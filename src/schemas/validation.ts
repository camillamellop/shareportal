import { z } from 'zod';

// Esquemas de validação para entidades do Firestore

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'manager', 'pilot', 'user'], {
    errorMap: () => ({ message: 'Role deve ser admin, manager, pilot ou user' })
  }),
  photoURL: z.string().url().optional(),
  photoPath: z.string().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const AeronaveSchema = z.object({
  id: z.string().optional(),
  matricula: z.string()
    .min(3, 'Matrícula deve ter pelo menos 3 caracteres')
    .max(10, 'Matrícula deve ter no máximo 10 caracteres')
    .regex(/^[A-Z]{2}-[A-Z]{3}$|^[A-Z]{3}-[A-Z]{4}$|^[A-Z0-9-]+$/, 'Formato de matrícula inválido'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano_diario: z.number()
    .int('Ano deve ser um número inteiro')
    .min(1900, 'Ano deve ser maior que 1900')
    .max(new Date().getFullYear() + 1, 'Ano não pode ser futuro'),
  horas_totais: z.number()
    .min(0, 'Horas totais não podem ser negativas')
    .max(99999, 'Valor muito alto para horas totais'),
  status: z.enum(['ativa', 'inativa', 'manutencao'], {
    errorMap: () => ({ message: 'Status deve ser ativa, inativa ou manutencao' })
  }),
  consumo_medio: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const VooSchema = z.object({
  id: z.string().optional(),
  data: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  hora_partida: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Hora de partida deve estar no formato HH:MM'),
  hora_chegada: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Hora de chegada deve estar no formato HH:MM'),
  origem: z.string()
    .min(3, 'Origem deve ter pelo menos 3 caracteres')
    .max(50, 'Origem muito longa'),
  destino: z.string()
    .min(3, 'Destino deve ter pelo menos 3 caracteres')
    .max(50, 'Destino muito longo'),
  piloto: z.string().min(1, 'Piloto é obrigatório'),
  copiloto: z.string().optional(),
  cotista: z.string().min(1, 'Cotista é obrigatório'),
  horas_voo: z.number()
    .min(0.1, 'Horas de voo deve ser maior que 0')
    .max(16, 'Voo não pode ter mais de 16 horas'),
  combustivel_inicial: z.number()
    .min(0, 'Combustível inicial não pode ser negativo'),
  combustivel_final: z.number()
    .min(0, 'Combustível final não pode ser negativo'),
  observacoes: z.string().optional(),
  pic_anac: z.string().optional(),
  sic_anac: z.string().optional(),
  voo_para: z.string().optional(),
  confere: z.string().optional(),
  aeronave_id: z.string().min(1, 'Aeronave é obrigatória'),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// Schema com validação adicional para combustível
export const VooSchemaWithValidation = VooSchema.refine((data) => {
  return data.combustivel_final <= data.combustivel_inicial;
}, {
  message: "Combustível final não pode ser maior que o inicial",
  path: ["combustivel_final"],
});

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  status: z.enum(['pending', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  assignedTo: z.string().min(1, 'Responsável é obrigatório'),
  dueDate: z.any(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const MessageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  sender: z.string().min(1, 'Remetente é obrigatório'),
  recipients: z.array(z.string()).min(1, 'Pelo menos um destinatário é obrigatório'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Prioridade deve ser low, medium ou high' })
  }),
  createdAt: z.any().optional(),
  readAt: z.any().optional(),
});

export const ContactSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .regex(/^[\d\s\(\)\-\+]+$/, 'Formato de telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal("")),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  categoria: z.enum(['clientes', 'fornecedores', 'colaboradores', 'outros'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  }),
  favorito: z.boolean(),
  observacoes: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const BirthdaySchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_aniversario: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/YYYY')
    .refine((date) => {
      const [day, month, year] = date.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return dateObj.getDate() === day && 
             dateObj.getMonth() === month - 1 && 
             dateObj.getFullYear() === year;
    }, 'Data inválida'),
  empresa: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const FuelStationSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  telefone: z.string().min(10, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  combustiveis: z.array(z.string()).min(1, 'Pelo menos um combustível é obrigatório'),
  horario_funcionamento: z.string().min(1, 'Horário de funcionamento é obrigatório'),
  observacoes: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const HotelSchema = z.object({
  id: z.string().optional(),
  hotel: z.string().min(1, 'Nome do hotel é obrigatório'),
  telefone: z.string().min(10, 'Telefone é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  preco_sgl: z.number().min(0, 'Preço single não pode ser negativo'),
  preco_dbl: z.number().min(0, 'Preço double não pode ser negativo'),
  observacoes: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export const RelatorioViagemSchema = z.object({
  id: z.string().optional(),
  cotista: z.string().min(1, 'Cotista é obrigatório'),
  aeronave: z.string().min(1, 'Aeronave é obrigatória'),
  tripulante: z.string().min(1, 'Tripulante é obrigatório'),
  destino: z.string().min(1, 'Destino é obrigatório'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de fim é obrigatória'),
  despesas: z.array(z.object({
    categoria: z.string().min(1, 'Categoria é obrigatória'),
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    valor: z.number().min(0, 'Valor não pode ser negativo'),
    pago_por: z.enum(['Tripulante', 'Cotista', 'Share Brasil']),
    comprovante_url: z.string().optional(),
  })),
  total_combustivel: z.number().min(0),
  total_hospedagem: z.number().min(0),
  total_alimentacao: z.number().min(0),
  total_transporte: z.number().min(0),
  total_outros: z.number().min(0),
  total_tripulante: z.number().min(0),
  total_cotista: z.number().min(0),
  total_share_brasil: z.number().min(0),
  valor_total: z.number().min(0),
  observacoes: z.string().optional(),
  status: z.enum(['pendente', 'aprovado', 'rejeitado']),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// Tipos TypeScript derivados dos esquemas
export type User = z.infer<typeof UserSchema>;
export type Aeronave = z.infer<typeof AeronaveSchema>;
export type Voo = z.infer<typeof VooSchemaWithValidation>;
export type Task = z.infer<typeof TaskSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Birthday = z.infer<typeof BirthdaySchema>;
export type FuelStation = z.infer<typeof FuelStationSchema>;
export type Hotel = z.infer<typeof HotelSchema>;
export type RelatorioViagem = z.infer<typeof RelatorioViagemSchema>;

// Função auxiliar para validação
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { 
      success: false, 
      errors: ['Erro de validação desconhecido'] 
    };
  }
}

// Esquemas para formulários (sem campos opcionais/gerados automaticamente)
export const AeronaveFormSchema = AeronaveSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const VooFormSchema = VooSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const ContactFormSchema = ContactSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const TaskFormSchema = TaskSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const MessageFormSchema = MessageSchema.omit({ 
  id: true, 
  createdAt: true, 
  readAt: true 
});