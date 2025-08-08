import '@testing-library/jest-dom';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup após cada teste
beforeEach(() => {
  cleanup();
});

// Mock do Firebase
beforeAll(() => {
  // Mock das APIs do navegador
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: any) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // Mock do localStorage
  const localStorageMock = {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null,
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock do sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
  });

  // Mock da API de clipboard
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: async (text: string) => Promise.resolve(),
      readText: async () => Promise.resolve(''),
    },
  });

  // Mock do ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock do Firebase Auth
vi.mock('@/integrations/firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
  storage: {
    ref: vi.fn(),
  },
}));

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  Navigate: () => null,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Mock das notificações
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: ({ children }: { children: React.ReactNode }) => children,
}));

// Aumentar timeout para testes assíncronos
beforeAll(() => {
  vi.setConfig({
    testTimeout: 10000,
  });
});