import { useState, useEffect } from 'react';
import { tripulacaoService, Tripulante } from '../services/tripulacaoService';

export function useTripulacao() {
  const [tripulantes, setTripulantes] = useState<Tripulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    chtVencidos: 0,
    cmaVencidos: 0,
    proximosVencimentos: 0
  });

  // Carregar todos os tripulantes
  const carregarTripulantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await tripulacaoService.buscarTripulantes();
      setTripulantes(dados);
      
      // Carregar estatísticas
      const stats = await tripulacaoService.buscarEstatisticas();
      setEstatisticas(stats);
    } catch (err) {
      setError('Erro ao carregar tripulantes');
      console.error('Erro ao carregar tripulantes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo tripulante
  const adicionarTripulante = async (tripulante: Omit<Tripulante, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const id = await tripulacaoService.adicionarTripulante(tripulante);
      
      // Recarregar dados
      await carregarTripulantes();
      
      return id;
    } catch (err) {
      setError('Erro ao adicionar tripulante');
      console.error('Erro ao adicionar tripulante:', err);
      throw err;
    }
  };

  // Atualizar tripulante
  const atualizarTripulante = async (id: string, dados: Partial<Tripulante>) => {
    try {
      setError(null);
      await tripulacaoService.atualizarTripulante(id, dados);
      
      // Recarregar dados
      await carregarTripulantes();
    } catch (err) {
      setError('Erro ao atualizar tripulante');
      console.error('Erro ao atualizar tripulante:', err);
      throw err;
    }
  };

  // Excluir tripulante
  const excluirTripulante = async (id: string) => {
    try {
      setError(null);
      await tripulacaoService.excluirTripulante(id);
      
      // Recarregar dados
      await carregarTripulantes();
    } catch (err) {
      setError('Erro ao excluir tripulante');
      console.error('Erro ao excluir tripulante:', err);
      throw err;
    }
  };

  // Upload de foto
  const uploadFoto = async (file: File, tripulanteId: string) => {
    try {
      setError(null);
      const url = await tripulacaoService.uploadFoto(file, tripulanteId);
      return url;
    } catch (err) {
      setError('Erro ao fazer upload da foto');
      console.error('Erro ao fazer upload da foto:', err);
      throw err;
    }
  };

  // Buscar tripulantes por status de certificado
  const buscarPorStatusCertificado = async (status: 'vencido' | 'proximo_vencimento') => {
    try {
      setError(null);
      const dados = await tripulacaoService.buscarPorStatusCertificado(status);
      return dados;
    } catch (err) {
      setError('Erro ao buscar por status');
      console.error('Erro ao buscar por status:', err);
      throw err;
    }
  };

  // Filtrar tripulantes localmente
  const filtrarTripulantes = (termo: string) => {
    if (!termo.trim()) return tripulantes;
    
    return tripulantes.filter(tripulante =>
      tripulante.nome.toLowerCase().includes(termo.toLowerCase()) ||
      tripulante.cargo.toLowerCase().includes(termo.toLowerCase()) ||
      tripulante.email.toLowerCase().includes(termo.toLowerCase()) ||
      tripulante.codigoANAC.includes(termo)
    );
  };

  // Carregar dados na inicialização
  useEffect(() => {
    carregarTripulantes();
  }, []);

  return {
    tripulantes,
    loading,
    error,
    estatisticas,
    carregarTripulantes,
    adicionarTripulante,
    atualizarTripulante,
    excluirTripulante,
    uploadFoto,
    buscarPorStatusCertificado,
    filtrarTripulantes
  };
} 