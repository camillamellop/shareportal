<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { logger } from "@/utils/logger";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await signOut(auth);
      logger.info("Usuário deslogado com sucesso");
    } catch (error) {
      const errorMessage = "Erro ao fazer logout";
      logger.error(errorMessage, error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        loading: false 
      }));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        logger.debug("Estado de autenticação alterado", { 
          userId: user?.uid,
          email: user?.email 
        });
        
        setState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        const errorMessage = "Erro na autenticação";
        logger.error(errorMessage, error);
        setState({
          user: null,
          loading: false,
          error: errorMessage,
        });
      }
    );
=======
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524

    return () => unsubscribe();
  }, []);

<<<<<<< HEAD
  return {
    ...state,
    logout,
    isAuthenticated: !!state.user,
  };
=======
  return { user, loading };
>>>>>>> 5a2fe9f1e34455bb147758d3a5626f2981a36524
}; 