import { describe, it, expect } from 'vitest';
import { 
  AeronaveSchema, 
  VooSchema, 
  ContactSchema,
  validateData 
} from '@/schemas/validation';

describe('Schemas de Validação', () => {
  describe('AeronaveSchema', () => {
    it('deve validar dados válidos de aeronave', () => {
      const validAeronave = {
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa' as const,
      };

      const result = validateData(AeronaveSchema, validAeronave);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining(validAeronave));
    });

    it('deve rejeitar matrícula inválida', () => {
      const invalidAeronave = {
        matricula: '123', // Formato inválido
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa' as const,
      };

      const result = validateData(AeronaveSchema, invalidAeronave);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Formato de matrícula inválido'));
    });

    it('deve rejeitar horas totais negativas', () => {
      const invalidAeronave = {
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: -100, // Valor negativo inválido
        status: 'ativa' as const,
      };

      const result = validateData(AeronaveSchema, invalidAeronave);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Horas totais não podem ser negativas'));
    });

    it('deve rejeitar ano inválido', () => {
      const invalidAeronave = {
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 1800, // Ano muito antigo
        horas_totais: 1500,
        status: 'ativa' as const,
      };

      const result = validateData(AeronaveSchema, invalidAeronave);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Ano deve ser maior que 1900'));
    });
  });

  describe('VooSchema', () => {
    it('deve validar dados válidos de voo', () => {
      const validVoo = {
        data: '2024-01-15',
        hora_partida: '10:30',
        hora_chegada: '12:45',
        origem: 'SBSP',
        destino: 'SBRJ',
        piloto: 'João Silva',
        cotista: 'Maria Santos',
        horas_voo: 2.25,
        combustivel_inicial: 100,
        combustivel_final: 75,
        aeronave_id: 'aeronave123',
      };

      const result = validateData(VooSchema, validVoo);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining(validVoo));
    });

    it('deve rejeitar formato de data inválido', () => {
      const invalidVoo = {
        data: '15/01/2024', // Formato brasileiro em vez de ISO
        hora_partida: '10:30',
        hora_chegada: '12:45',
        origem: 'SBSP',
        destino: 'SBRJ',
        piloto: 'João Silva',
        cotista: 'Maria Santos',
        horas_voo: 2.25,
        combustivel_inicial: 100,
        combustivel_final: 75,
        aeronave_id: 'aeronave123',
      };

      const result = validateData(VooSchema, invalidVoo);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Data deve estar no formato YYYY-MM-DD'));
    });

    it('deve rejeitar combustível final maior que inicial', () => {
      const invalidVoo = {
        data: '2024-01-15',
        hora_partida: '10:30',
        hora_chegada: '12:45',
        origem: 'SBSP',
        destino: 'SBRJ',
        piloto: 'João Silva',
        cotista: 'Maria Santos',
        horas_voo: 2.25,
        combustivel_inicial: 50,
        combustivel_final: 100, // Maior que o inicial
        aeronave_id: 'aeronave123',
      };

      const result = validateData(VooSchema, invalidVoo);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Combustível final não pode ser maior que o inicial'));
    });

    it('deve rejeitar horas de voo excessivas', () => {
      const invalidVoo = {
        data: '2024-01-15',
        hora_partida: '10:30',
        hora_chegada: '12:45',
        origem: 'SBSP',
        destino: 'SBRJ',
        piloto: 'João Silva',
        cotista: 'Maria Santos',
        horas_voo: 20, // Mais de 16 horas
        combustivel_inicial: 100,
        combustivel_final: 75,
        aeronave_id: 'aeronave123',
      };

      const result = validateData(VooSchema, invalidVoo);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Voo não pode ter mais de 16 horas'));
    });
  });

  describe('ContactSchema', () => {
    it('deve validar contato válido', () => {
      const validContact = {
        nome: 'João Silva',
        telefone: '(11) 99999-9999',
        email: 'joao@example.com',
        empresa: 'Empresa ABC',
        cargo: 'Gerente',
        categoria: 'clientes' as const,
        favorito: true,
      };

      const result = validateData(ContactSchema, validContact);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining(validContact));
    });

    it('deve rejeitar email inválido', () => {
      const invalidContact = {
        nome: 'João Silva',
        telefone: '(11) 99999-9999',
        email: 'email-invalido', // Email sem formato correto
        categoria: 'clientes' as const,
        favorito: false,
      };

      const result = validateData(ContactSchema, invalidContact);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Email inválido'));
    });

    it('deve rejeitar telefone muito curto', () => {
      const invalidContact = {
        nome: 'João Silva',
        telefone: '123', // Muito curto
        categoria: 'clientes' as const,
        favorito: false,
      };

      const result = validateData(ContactSchema, invalidContact);
      expect(result.success).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Telefone deve ter pelo menos 10 dígitos'));
    });
  });
});