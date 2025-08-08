import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/stores/appStore';
import type { Aeronave, Task } from '@/schemas/validation';

describe('App Store', () => {
  beforeEach(() => {
    // Limpar o store antes de cada teste
    useAppStore.getState().clearAll();
  });

  describe('User State', () => {
    it('deve inicializar com user null', () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.user).toBeNull();
    });

    it('deve atualizar o usuário', () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      } as any;

      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Aeronaves State', () => {
    it('deve adicionar uma aeronave', () => {
      const mockAeronave: Aeronave = {
        id: '1',
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addAeronave(mockAeronave);
      });

      expect(result.current.aeronaves).toHaveLength(1);
      expect(result.current.aeronaves[0]).toEqual(mockAeronave);
    });

    it('deve atualizar uma aeronave', () => {
      const mockAeronave: Aeronave = {
        id: '1',
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      // Adicionar aeronave
      act(() => {
        result.current.addAeronave(mockAeronave);
      });

      // Atualizar horas
      act(() => {
        result.current.updateAeronave('1', { horas_totais: 1600 });
      });

      expect(result.current.aeronaves[0].horas_totais).toBe(1600);
    });

    it('deve remover uma aeronave', () => {
      const mockAeronave: Aeronave = {
        id: '1',
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      // Adicionar e depois remover
      act(() => {
        result.current.addAeronave(mockAeronave);
      });

      expect(result.current.aeronaves).toHaveLength(1);

      act(() => {
        result.current.removeAeronave('1');
      });

      expect(result.current.aeronaves).toHaveLength(0);
    });
  });

  describe('Tasks State', () => {
    it('deve adicionar uma task', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        assignedTo: 'test-user',
        dueDate: new Date() as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addTask(mockTask);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(mockTask);
    });

    it('deve atualizar status de uma task', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        assignedTo: 'test-user',
        dueDate: new Date() as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      // Adicionar task
      act(() => {
        result.current.addTask(mockTask);
      });

      // Atualizar status
      act(() => {
        result.current.updateTask('1', { status: 'completed' });
      });

      expect(result.current.tasks[0].status).toBe('completed');
    });
  });

  describe('Loading and Error State', () => {
    it('deve gerenciar estado de loading', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve gerenciar estado de erro', () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.setError('Test error message');
      });

      expect(result.current.error).toBe('Test error message');

      // Limpar erro
      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('deve verificar se deve fazer fetch baseado no cache', () => {
      const { result } = renderHook(() => useAppStore());

      // Primeira vez deve fazer fetch
      expect(result.current.shouldFetch('aeronaves')).toBe(true);

      // Atualizar timestamp do cache
      act(() => {
        result.current.updateLastFetch('aeronaves');
      });

      // Agora não deve fazer fetch (cache ainda válido)
      expect(result.current.shouldFetch('aeronaves')).toBe(false);

      // Com cache expirado deve fazer fetch
      expect(result.current.shouldFetch('aeronaves', 0)).toBe(true);
    });
  });

  describe('Selectors', () => {
    it('deve filtrar tarefas ativas com useActiveTasks', () => {
      const completedTask: Task = {
        id: '1',
        title: 'Completed Task',
        description: 'Test Description',
        status: 'completed',
        assignedTo: 'test-user',
        dueDate: new Date() as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const pendingTask: Task = {
        id: '2',
        title: 'Pending Task',
        description: 'Test Description',
        status: 'pending',
        assignedTo: 'test-user',
        dueDate: new Date() as any,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.addTask(completedTask);
        result.current.addTask(pendingTask);
      });

      const { result: activeTasks } = renderHook(() => useAppStore(state => 
        state.tasks.filter(task => task.status !== 'completed')
      ));

      expect(activeTasks.current).toHaveLength(1);
      expect(activeTasks.current[0].id).toBe('2');
    });
  });

  describe('Clear All', () => {
    it('deve limpar todos os dados', () => {
      const mockAeronave: Aeronave = {
        id: '1',
        matricula: 'PT-ABC',
        modelo: 'Cessna 172',
        ano_diario: 2020,
        horas_totais: 1500,
        status: 'ativa',
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      const { result } = renderHook(() => useAppStore());

      // Adicionar dados
      act(() => {
        result.current.addAeronave(mockAeronave);
        result.current.setError('Test error');
        result.current.setLoading(true);
      });

      // Verificar que dados foram adicionados
      expect(result.current.aeronaves).toHaveLength(1);
      expect(result.current.error).toBe('Test error');
      expect(result.current.isLoading).toBe(true);

      // Limpar todos os dados
      act(() => {
        result.current.clearAll();
      });

      // Verificar que tudo foi limpo
      expect(result.current.aeronaves).toHaveLength(0);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});