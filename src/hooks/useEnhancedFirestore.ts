import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EnhancedFirestoreService } from '@/services/enhanced-firestore';
import { useAppStore } from '@/stores/appStore';
import { 
  AeronaveSchema, 
  VooSchema, 
  TaskSchema, 
  MessageSchema, 
  ContactSchema, 
  BirthdaySchema,
  type Aeronave,
  type Voo,
  type Task,
  type Message,
  type Contact,
  type Birthday
} from '@/schemas/validation';

// Configuração global de React Query
export const queryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
  retry: 3,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

// Instâncias dos serviços com validação
const aeronaveService = new EnhancedFirestoreService<Aeronave>('aeronaves', AeronaveSchema);
const vooService = new EnhancedFirestoreService<Voo>('voos', VooSchema);
const taskService = new EnhancedFirestoreService<Task>('tasks', TaskSchema);
const messageService = new EnhancedFirestoreService<Message>('messages', MessageSchema);
const contactService = new EnhancedFirestoreService<Contact>('contacts', ContactSchema);
const birthdayService = new EnhancedFirestoreService<Birthday>('birthdays', BirthdaySchema);

// Hook genérico para CRUD
function useFirestoreCollection<T>(
  collectionName: string,
  service: EnhancedFirestoreService<T>
) {
  const queryClient = useQueryClient();
  const setError = useAppStore(state => state.setError);
  
  // Query para buscar todos
  const useGetAll = () => {
    return useQuery({
      queryKey: [collectionName, 'all'],
      queryFn: () => service.getAll(),
      ...queryConfig,
      onError: (error: any) => {
        const message = `Erro ao carregar ${collectionName}: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  // Query para buscar por ID
  const useGetById = (id: string, enabled = true) => {
    return useQuery({
      queryKey: [collectionName, 'byId', id],
      queryFn: () => service.getById(id),
      enabled: enabled && !!id,
      ...queryConfig,
      onError: (error: any) => {
        const message = `Erro ao carregar item: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  // Mutation para criar
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: Omit<T, 'id'>) => service.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries([collectionName]);
        toast.success('Item criado com sucesso');
        setError(null);
      },
      onError: (error: any) => {
        const message = `Erro ao criar item: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  // Mutation para atualizar
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => 
        service.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries([collectionName]);
        toast.success('Item atualizado com sucesso');
        setError(null);
      },
      onError: (error: any) => {
        const message = `Erro ao atualizar item: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  // Mutation para deletar
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries([collectionName]);
        toast.success('Item removido com sucesso');
        setError(null);
      },
      onError: (error: any) => {
        const message = `Erro ao remover item: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  // Query customizada
  const useQuery = (
    filters: { field: string; operator: any; value: any }[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ) => {
    const queryKey = [collectionName, 'query', { filters, orderByField, orderDirection, limitCount }];
    
    return useQuery({
      queryKey,
      queryFn: () => service.query(filters, orderByField, orderDirection, limitCount),
      ...queryConfig,
      onError: (error: any) => {
        const message = `Erro na consulta: ${error.message}`;
        setError(message);
        toast.error(message);
      }
    });
  };
  
  return {
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
    useQuery
  };
}

// Hook para Aeronaves
export function useAeronaves() {
  const hooks = useFirestoreCollection('aeronaves', aeronaveService);
  
  // Query específica para aeronaves ativas
  const useGetActive = () => {
    return hooks.useQuery([{ field: 'status', operator: '==', value: 'ativa' }]);
  };
  
  // Query para buscar por matrícula
  const useGetByMatricula = (matricula: string) => {
    return hooks.useQuery([{ field: 'matricula', operator: '==', value: matricula }]);
  };
  
  return {
    ...hooks,
    useGetActive,
    useGetByMatricula
  };
}

// Hook para Voos
export function useVoos() {
  const hooks = useFirestoreCollection('voos', vooService);
  
  // Query para voos por aeronave
  const useGetByAeronave = (aeronaveId: string) => {
    return hooks.useQuery(
      [{ field: 'aeronave_id', operator: '==', value: aeronaveId }],
      'data',
      'desc'
    );
  };
  
  // Query para voos por piloto
  const useGetByPiloto = (picAnac: string) => {
    return hooks.useQuery(
      [{ field: 'pic_anac', operator: '==', value: picAnac }],
      'data',
      'desc'
    );
  };
  
  // Query para voos por período
  const useGetByPeriod = (dataInicio: string, dataFim: string) => {
    return hooks.useQuery([
      { field: 'data', operator: '>=', value: dataInicio },
      { field: 'data', operator: '<=', value: dataFim }
    ], 'data', 'desc');
  };
  
  return {
    ...hooks,
    useGetByAeronave,
    useGetByPiloto,
    useGetByPeriod
  };
}

// Hook para Tasks
export function useTasks() {
  const hooks = useFirestoreCollection('tasks', taskService);
  
  // Query para tasks por usuário
  const useGetByUser = (userId: string) => {
    return hooks.useQuery(
      [{ field: 'assignedTo', operator: '==', value: userId }],
      'dueDate',
      'asc'
    );
  };
  
  // Query para tasks por status
  const useGetByStatus = (status: Task['status']) => {
    return hooks.useQuery(
      [{ field: 'status', operator: '==', value: status }],
      'dueDate',
      'asc'
    );
  };
  
  // Query para tasks pendentes
  const useGetPending = () => {
    return hooks.useQuery(
      [{ field: 'status', operator: 'in', value: ['pending', 'in_progress'] }],
      'dueDate',
      'asc'
    );
  };
  
  return {
    ...hooks,
    useGetByUser,
    useGetByStatus,
    useGetPending
  };
}

// Hook para Messages
export function useMessages() {
  const hooks = useFirestoreCollection('messages', messageService);
  
  // Query para mensagens por destinatário
  const useGetByRecipient = (userId: string) => {
    return hooks.useQuery(
      [{ field: 'recipients', operator: 'array-contains', value: userId }],
      'createdAt',
      'desc'
    );
  };
  
  // Query para mensagens não lidas
  const useGetUnread = (userId: string) => {
    return hooks.useQuery([
      { field: 'recipients', operator: 'array-contains', value: userId },
      { field: 'readAt', operator: '==', value: null }
    ], 'createdAt', 'desc');
  };
  
  return {
    ...hooks,
    useGetByRecipient,
    useGetUnread
  };
}

// Hook para Contacts
export function useContacts() {
  const hooks = useFirestoreCollection('contacts', contactService);
  
  // Query por categoria
  const useGetByCategory = (categoria: Contact['categoria']) => {
    return hooks.useQuery(
      [{ field: 'categoria', operator: '==', value: categoria }],
      'nome',
      'asc'
    );
  };
  
  // Query para favoritos
  const useGetFavorites = () => {
    return hooks.useQuery(
      [{ field: 'favorito', operator: '==', value: true }],
      'nome',
      'asc'
    );
  };
  
  return {
    ...hooks,
    useGetByCategory,
    useGetFavorites
  };
}

// Hook para Birthdays
export function useBirthdays() {
  const hooks = useFirestoreCollection('birthdays', birthdayService);
  
  // Query para aniversários do mês
  const useGetByMonth = (month: number) => {
    // Esta query precisa ser implementada no lado cliente pois envolve parsing de string
    const { data: allBirthdays, ...queryResult } = hooks.useGetAll();
    
    const birthdaysOfMonth = React.useMemo(() => {
      if (!allBirthdays) return [];
      return allBirthdays.filter(birthday => {
        const [, monthStr] = birthday.data_aniversario.split('/');
        return parseInt(monthStr) === month;
      });
    }, [allBirthdays, month]);
    
    return {
      ...queryResult,
      data: birthdaysOfMonth
    };
  };
  
  // Query para próximos aniversários
  const useGetUpcoming = () => {
    const { data: allBirthdays, ...queryResult } = hooks.useGetAll();
    
    const upcomingBirthdays = React.useMemo(() => {
      if (!allBirthdays) return [];
      
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      
      return allBirthdays.filter(birthday => {
        const [day, monthStr] = birthday.data_aniversario.split('/');
        const birthdayDate = new Date(today.getFullYear(), parseInt(monthStr) - 1, parseInt(day));
        
        if (birthdayDate < today) {
          birthdayDate.setFullYear(today.getFullYear() + 1);
        }
        
        return birthdayDate <= nextMonth;
      }).sort((a, b) => {
        const [dayA, monthA] = a.data_aniversario.split('/').map(Number);
        const [dayB, monthB] = b.data_aniversario.split('/').map(Number);
        
        const dateA = new Date(today.getFullYear(), monthA - 1, dayA);
        const dateB = new Date(today.getFullYear(), monthB - 1, dayB);
        
        if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
        if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);
        
        return dateA.getTime() - dateB.getTime();
      });
    }, [allBirthdays]);
    
    return {
      ...queryResult,
      data: upcomingBirthdays
    };
  };
  
  return {
    ...hooks,
    useGetByMonth,
    useGetUpcoming
  };
}

// Hook utilitário para invalidar múltiplas coleções
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries();
    toast.info('Dados atualizados');
  };
  
  const invalidateCollection = (collectionName: string) => {
    queryClient.invalidateQueries([collectionName]);
  };
  
  return {
    invalidateAll,
    invalidateCollection
  };
}

// Hook para monitorar status de conexão
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}