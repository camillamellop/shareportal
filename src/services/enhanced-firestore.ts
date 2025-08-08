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
  Timestamp,
  enableNetwork,
  disableNetwork
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { auth } from "@/integrations/firebase/config";
import { validateData } from "@/schemas/validation";
import { z } from "zod";

// Configuração de retry
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
};

// Tipos para logging
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Sistema de logging melhorado
class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, data);
        }
        break;
      default:
        console.log(logMessage, data);
    }
  }
  
  info(message: string, data?: any) {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any) {
    this.log('error', message, data);
  }
  
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
}

const logger = Logger.getInstance();

// Classe para erros customizados
export class FirestoreServiceError extends Error {
  constructor(
    message: string,
    public operation: string,
    public collection: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FirestoreServiceError';
  }
}

// Função para retry com backoff exponencial
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxAttempts = RETRY_CONFIG.maxAttempts
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        logger.error(`${operationName} failed after ${maxAttempts} attempts`, error);
        throw error;
      }
      
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelay
      );
      
      logger.warn(`${operationName} attempt ${attempt} failed, retrying in ${delay}ms`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Função para verificar conectividade
export async function checkConnection(): Promise<boolean> {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    logger.error('Network check failed', error);
    return false;
  }
}

// Cache em memória simples
class SimpleCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  
  set(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Serviço melhorado do Firestore
export class EnhancedFirestoreService<T> {
  private cache = new SimpleCache<T[]>();
  private singleCache = new SimpleCache<T>();
  
  constructor(
    private collectionName: string,
    private schema?: z.ZodSchema<T>
  ) {}

  // Buscar todos os documentos com cache
  async getAll(useCache = true): Promise<T[]> {
    const cacheKey = `${this.collectionName}_all`;
    
    if (useCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for ${this.collectionName}_all`);
        return cachedData;
      }
    }
    
    try {
      const result = await withRetry(async () => {
        const querySnapshot = await getDocs(collection(db, this.collectionName));
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
      }, `getAll ${this.collectionName}`);
      
      // Validar dados se schema for fornecido
      if (this.schema) {
        const validatedResults: T[] = [];
        for (const item of result) {
          const validation = validateData(this.schema, item);
          if (validation.success && validation.data) {
            validatedResults.push(validation.data);
          } else {
            logger.warn(`Invalid data found in ${this.collectionName}`, {
              id: (item as any).id,
              errors: validation.errors
            });
          }
        }
        this.cache.set(cacheKey, validatedResults);
        return validatedResults;
      }
      
      this.cache.set(cacheKey, result);
      logger.info(`Fetched ${result.length} items from ${this.collectionName}`);
      return result;
      
    } catch (error) {
      const errorMsg = `Falha ao buscar dados de ${this.collectionName}`;
      logger.error(errorMsg, error);
      throw new FirestoreServiceError(errorMsg, 'getAll', this.collectionName, error);
    }
  }

  // Buscar documento por ID com cache
  async getById(id: string, useCache = true): Promise<T | null> {
    const cacheKey = `${this.collectionName}_${id}`;
    
    if (useCache) {
      const cachedData = this.singleCache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for ${this.collectionName}_${id}`);
        return cachedData;
      }
    }
    
    try {
      const result = await withRetry(async () => {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as T;
        }
        return null;
      }, `getById ${this.collectionName}/${id}`);
      
      if (result) {
        // Validar dados se schema for fornecido
        if (this.schema) {
          const validation = validateData(this.schema, result);
          if (validation.success && validation.data) {
            this.singleCache.set(cacheKey, validation.data);
            return validation.data;
          } else {
            logger.warn(`Invalid data found in ${this.collectionName}/${id}`, validation.errors);
            return null;
          }
        }
        
        this.singleCache.set(cacheKey, result);
      }
      
      return result;
      
    } catch (error) {
      const errorMsg = `Falha ao buscar documento ${id} de ${this.collectionName}`;
      logger.error(errorMsg, error);
      throw new FirestoreServiceError(errorMsg, 'getById', this.collectionName, error);
    }
  }

  // Criar novo documento com validação
  async create(data: Omit<T, 'id'>): Promise<string> {
    // Validar dados se schema for fornecido
    if (this.schema) {
      const validation = validateData(this.schema, { ...data, id: 'temp' });
      if (!validation.success) {
        throw new FirestoreServiceError(
          `Dados inválidos: ${validation.errors?.join(', ')}`,
          'create',
          this.collectionName
        );
      }
    }
    
    try {
      const result = await withRetry(async () => {
        const docRef = await addDoc(collection(db, this.collectionName), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return docRef.id;
      }, `create ${this.collectionName}`);
      
      // Limpar cache
      this.cache.clear();
      logger.info(`Created document ${result} in ${this.collectionName}`);
      return result;
      
    } catch (error) {
      const errorMsg = `Falha ao criar documento em ${this.collectionName}`;
      logger.error(errorMsg, error);
      throw new FirestoreServiceError(errorMsg, 'create', this.collectionName, error);
    }
  }

  // Atualizar documento com validação
  async update(id: string, data: Partial<T>): Promise<void> {
    // Validação básica
    if (this.schema && Object.keys(data).length > 0) {
      // Buscar documento atual para validação completa
      const currentDoc = await this.getById(id, false);
      if (currentDoc) {
        const updatedDoc = { ...currentDoc, ...data };
        const validation = validateData(this.schema, updatedDoc);
        if (!validation.success) {
          throw new FirestoreServiceError(
            `Dados inválidos: ${validation.errors?.join(', ')}`,
            'update',
            this.collectionName
          );
        }
      }
    }
    
    try {
      await withRetry(async () => {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
      }, `update ${this.collectionName}/${id}`);
      
      // Limpar cache
      this.cache.clear();
      this.singleCache.delete(`${this.collectionName}_${id}`);
      logger.info(`Updated document ${id} in ${this.collectionName}`);
      
    } catch (error) {
      const errorMsg = `Falha ao atualizar documento ${id} em ${this.collectionName}`;
      logger.error(errorMsg, error);
      throw new FirestoreServiceError(errorMsg, 'update', this.collectionName, error);
    }
  }

  // Deletar documento
  async delete(id: string): Promise<void> {
    try {
      await withRetry(async () => {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
      }, `delete ${this.collectionName}/${id}`);
      
      // Limpar cache
      this.cache.clear();
      this.singleCache.delete(`${this.collectionName}_${id}`);
      logger.info(`Deleted document ${id} from ${this.collectionName}`);
      
    } catch (error) {
      const errorMsg = `Falha ao deletar documento ${id} de ${this.collectionName}`;
      logger.error(errorMsg, error);
      throw new FirestoreServiceError(errorMsg, 'delete', this.collectionName, error);
    }
  }

  // Buscar com filtros e cache inteligente
  async query(
    filters: { field: string; operator: any; value: any }[] = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number,
    useCache = true
  ): Promise<T[]> {
    const cacheKey = `${this.collectionName}_query_${JSON.stringify({ filters, orderByField, orderDirection, limitCount })}`;
    
    if (useCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for query ${cacheKey}`);
        return cachedData;
      }
    }
    
    try {
      const result = await withRetry(async () => {
        let q = collection(db, this.collectionName);
        
        // Aplicar filtros
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
        
        // Aplicar ordenação
        if (orderByField) {
          q = query(q, orderBy(orderByField, orderDirection));
        }
        
        // Aplicar limite
        if (limitCount) {
          q = query(q, limit(limitCount));
        }
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
      }, `query ${this.collectionName}`);
      
      // Validar dados se schema for fornecido
      if (this.schema) {
        const validatedResults: T[] = [];
        for (const item of result) {
          const validation = validateData(this.schema, item);
          if (validation.success && validation.data) {
            validatedResults.push(validation.data);
          } else {
            logger.warn(`Invalid data found in query ${this.collectionName}`, {
              id: (item as any).id,
              errors: validation.errors
            });
          }
        }
        this.cache.set(cacheKey, validatedResults);
        return validatedResults;
      }
      
      this.cache.set(cacheKey, result);
      logger.info(`Query returned ${result.length} items from ${this.collectionName}`);
      return result;
      
    } catch (error) {
      const errorMsg = `Falha na query de ${this.collectionName}`;
      logger.error(errorMsg, error);
      
      // Se for erro de índice, sugerir criação
      if (error instanceof Error && error.message.includes('index')) {
        logger.warn(`Index missing for query in ${this.collectionName}. Consider adding to firestore.indexes.json:`, {
          collection: this.collectionName,
          filters,
          orderBy: orderByField
        });
      }
      
      throw new FirestoreServiceError(errorMsg, 'query', this.collectionName, error);
    }
  }

  // Limpar cache manualmente
  clearCache(): void {
    this.cache.clear();
    this.singleCache.clear();
    logger.info(`Cache cleared for ${this.collectionName}`);
  }

  // Verificar se usuário tem permissão
  async checkPermission(operation: 'read' | 'write'): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      
      // Aqui você pode implementar lógica mais complexa de permissões
      // Por exemplo, verificar role do usuário
      
      return true;
    } catch (error) {
      logger.error('Permission check failed', error);
      return false;
    }
  }
}