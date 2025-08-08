import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import type { Aeronave, Task, Message, Contact } from '@/services/firestore';
import { logger } from '@/utils/logger';

interface AppState {
  // User state
  user: User | null;
  userProfile: any | null;
  
  // Application data
  aeronaves: Aeronave[];
  tasks: Task[];
  messages: Message[];
  contacts: Contact[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Cache timestamps
  lastFetch: {
    aeronaves: number | null;
    tasks: number | null;
    messages: number | null;
    contacts: number | null;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: any) => void;
  setAeronaves: (aeronaves: Aeronave[]) => void;
  setTasks: (tasks: Task[]) => void;
  setMessages: (messages: Message[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Add items
  addTask: (task: Task) => void;
  addMessage: (message: Message) => void;
  addAeronave: (aeronave: Aeronave) => void;
  addContact: (contact: Contact) => void;
  
  // Update items
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateAeronave: (id: string, updates: Partial<Aeronave>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  
  // Remove items
  removeTask: (id: string) => void;
  removeAeronave: (id: string) => void;
  removeContact: (id: string) => void;
  
  // Cache helpers
  shouldFetch: (key: keyof AppState['lastFetch'], maxAge?: number) => boolean;
  updateLastFetch: (key: keyof AppState['lastFetch']) => void;
  
  // Clear all data (logout)
  clearAll: () => void;
}

const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        userProfile: null,
        aeronaves: [],
        tasks: [],
        messages: [],
        contacts: [],
        isLoading: false,
        error: null,
        sidebarOpen: true,
        theme: 'system',
        lastFetch: {
          aeronaves: null,
          tasks: null,
          messages: null,
          contacts: null,
        },
        
        // Actions
        setUser: (user) => {
          logger.debug("Usuário atualizado no store", { userId: user?.uid });
          set({ user });
        },
        setUserProfile: (userProfile) => set({ userProfile }),
        setAeronaves: (aeronaves) => {
          logger.debug("Aeronaves atualizadas no store", { count: aeronaves.length });
          set({ aeronaves });
        },
        setTasks: (tasks) => {
          logger.debug("Tarefas atualizadas no store", { count: tasks.length });
          set({ tasks });
        },
        setMessages: (messages) => {
          logger.debug("Mensagens atualizadas no store", { count: messages.length });
          set({ messages });
        },
        setContacts: (contacts) => {
          logger.debug("Contatos atualizados no store", { count: contacts.length });
          set({ contacts });
        },
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => {
          if (error) {
            logger.error("Erro no store", { error });
          }
          set({ error });
        },
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setTheme: (theme) => set({ theme }),
        
        // Add items
        addTask: (task) => set((state) => ({ 
          tasks: [...state.tasks, task] 
        })),
        addMessage: (message) => set((state) => ({ 
          messages: [message, ...state.messages] 
        })),
        addAeronave: (aeronave) => set((state) => ({ 
          aeronaves: [...state.aeronaves, aeronave] 
        })),
        addContact: (contact) => set((state) => ({ 
          contacts: [...state.contacts, contact] 
        })),
        
        // Update items
        updateTask: (id, updates) => set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, ...updates } : task
          )
        })),
        updateAeronave: (id, updates) => set((state) => ({
          aeronaves: state.aeronaves.map(aeronave => 
            aeronave.id === id ? { ...aeronave, ...updates } : aeronave
          )
        })),
        updateContact: (id, updates) => set((state) => ({
          contacts: state.contacts.map(contact => 
            contact.id === id ? { ...contact, ...updates } : contact
          )
        })),
        
        // Remove items
        removeTask: (id) => set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        })),
        removeAeronave: (id) => set((state) => ({
          aeronaves: state.aeronaves.filter(aeronave => aeronave.id !== id)
        })),
        removeContact: (id) => set((state) => ({
          contacts: state.contacts.filter(contact => contact.id !== id)
        })),
        
        // Cache helpers
        shouldFetch: (key, maxAge = CACHE_MAX_AGE) => {
          const lastFetch = get().lastFetch[key];
          if (!lastFetch) return true;
          return Date.now() - lastFetch > maxAge;
        },
        
        updateLastFetch: (key) => set((state) => ({
          lastFetch: {
            ...state.lastFetch,
            [key]: Date.now()
          }
        })),
        
        // Clear all data
        clearAll: () => {
          logger.info("Limpando todos os dados do store");
          set({
            user: null,
            userProfile: null,
            aeronaves: [],
            tasks: [],
            messages: [],
            contacts: [],
            isLoading: false,
            error: null,
            lastFetch: {
              aeronaves: null,
              tasks: null,
              messages: null,
              contacts: null,
            }
          });
        }
      }),
      {
        name: 'portalshare-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          // Don't persist sensitive data
        })
      }
    ),
    {
      name: 'PortalShare Store'
    }
  )
);

// Selectors otimizados com memoização
export const useUser = () => useAppStore((state) => state.user);
export const useUserProfile = () => useAppStore((state) => state.userProfile);
export const useAeronaves = () => useAppStore((state) => state.aeronaves);
export const useTasks = () => useAppStore((state) => state.tasks);
export const useMessages = () => useAppStore((state) => state.messages);
export const useContacts = () => useAppStore((state) => state.contacts);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);

// Selectors filtrados com memoização
export const useActiveTasks = () => useAppStore((state) => 
  state.tasks.filter(task => task.status !== 'completed')
);

export const useUnreadMessages = () => useAppStore((state) => 
  state.messages.filter(message => !message.readAt)
);

export const useActiveAeronaves = () => useAppStore((state) => 
  state.aeronaves.filter(aeronave => aeronave.status === 'ativa')
);

export const useFavoriteContacts = () => useAppStore((state) => 
  state.contacts.filter(contact => contact.favorito)
);

// Selectors com computação otimizada
export const useTaskStats = () => useAppStore((state) => {
  const tasks = state.tasks;
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
  };
});

export const useMessageStats = () => useAppStore((state) => {
  const messages = state.messages;
  return {
    total: messages.length,
    unread: messages.filter(m => !m.readAt).length,
    highPriority: messages.filter(m => m.priority === 'high').length,
  };
});