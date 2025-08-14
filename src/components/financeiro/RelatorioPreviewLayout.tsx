import React from 'react';
import { Plane, User, Calendar, FileText, Receipt, Edit, CheckCircle, ArrowLeft } from 'lucide-react';

// Interfaces atualizadas
interface DespesaViagem { 
  id: string; 
  categoria: string; 
  descricao: string; 
  valor: number; 
  data: any; 
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string; 
  comprovante_nome?: string; 
}

interface RelatorioViagemForm { 
  numero: string; 
  cotista: string; 
  aeronave: string; 
  tripulante: string; 
  destino: string; 
  data_inicio: any; 
  data_fim: any; 
  despesas: DespesaViagem[]; 
  observacoes: string; 
  criado_por?: string;
}

interface EmpresaInfo {
  razaoSocial: string; 
  cnpj: string; 
  inscricaoMunicipal?: string;
  endereco: string; 
  cidade: string;
  estado: string; 
  cep: string;
}

interface TotalsInfo {
  total_tripulante: number;
  total_cotista: number;
  total_share_brasil: number;
  valor_total: number;
}

interface RelatorioPreviewProps {
  dadosEmpresa: EmpresaInfo;
  formData: RelatorioViagemForm;
  // Pode receber totals separadamente ou valorTotal diretamente
  totals?: TotalsInfo;
  valorTotal?: number;
  formatDate: (date: any) => string;
  formatCurrency: (value: number) => string;
  setViewMode: (mode: 'list' | 'form' | 'preview' | null) => void;
  handleSubmit?: () => void;
  isSubmitting: boolean;
  status?: 'RASCUNHO' | 'SALVO' | 'ENVIADO';
}

export const RelatorioPreviewLayout: React.FC<RelatorioPreviewProps> = ({
  dadosEmpresa, 
  formData, 
  totals,
  valorTotal,
  formatDate, 
  formatCurrency, 
  setViewMode, 
  handleSubmit, 
  isSubmitting, 
  status
}) => {
  const isViewingSavedReport = !!status;

  // Calcular totais se não foram fornecidos
  const calculatedTotals = React.useMemo(() => {
    if (totals) return totals;
    
    // Se não temos totals, calcular baseado nas despesas
    const total_tripulante = formData.despesas?.reduce((sum, despesa) => 
      despesa.pago_por === 'Tripulante' ? sum + (despesa.valor || 0) : sum, 0) || 0;
    
    const total_cotista = formData.despesas?.reduce((sum, despesa) => 
      despesa.pago_por === 'Cotista' ? sum + (despesa.valor || 0) : sum, 0) || 0;
    
    const total_share_brasil = formData.despesas?.reduce((sum, despesa) => 
      despesa.pago_por === 'Share Brasil' ? sum + (despesa.valor || 0) : sum, 0) || 0;
    
    const valor_total = valorTotal || (total_tripulante + total_cotista + total_share_brasil);
    
    return {
      total_tripulante,
      total_cotista,
      total_share_brasil,
      valor_total
    };
  }, [totals, valorTotal, formData.despesas]);

  // Função para obter a cor do status
  const getStatusColor = (currentStatus?: string) => {
    switch (currentStatus) {
      case 'RASCUNHO': 
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'SALVO': 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ENVIADO': 
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 md:p-8 rounded-lg min-h-screen">
      {/* Cabeçalho da Empresa */}
      <div className="flex flex-col md:flex-row justify-between items-start pb-6 border-b border-gray-700 mb-8">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">{dadosEmpresa.razaoSocial}</h2>
          <div className="text-sm text-gray-400 space-y-1">
            <p>CNPJ: {dadosEmpresa.cnpj}</p>
            {dadosEmpresa.inscricaoMunicipal && (
              <p>Inscrição Municipal: {dadosEmpresa.inscricaoMunicipal}</p>
            )}
            <p>{dadosEmpresa.endereco}</p>
            <p>{dadosEmpresa.cidade}, {dadosEmpresa.estado} - CEP: {dadosEmpresa.cep}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <img 
            src="https://i.ibb.co/qL88CDcV/Logo-Share.png" 
            alt="Logo Share Brasil" 
            className="w-32 h-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Título e Status */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          Relatório de Despesas de Viagem
        </h1>
        <p className="text-xl text-gray-300">#{formData.numero}</p>
        {isViewingSavedReport && status && (
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
              Status: {status}
            </span>
          </div>
        )}
      </div>

      {/* Informações da Viagem */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plane size={20} className="text-blue-400"/>
          Informações da Viagem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-gray-400 font-medium">Cotista:</p>
            <p className="text-white">{formData.cotista}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 font-medium">Tripulante:</p>
            <p className="text-white">{formData.tripulante}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 font-medium">Aeronave:</p>
            <p className="text-white">{formData.aeronave}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 font-medium">Destino:</p>
            <p className="text-white">{formData.destino}</p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-gray-400 font-medium">Período:</p>
            <p className="text-white">
              {formatDate(formData.data_inicio)} a {formatDate(formData.data_fim)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabela de Despesas */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt size={20} className="text-green-400"/>
          Despesas ({formData.despesas?.length || 0} itens)
        </h3>
        
        {!formData.despesas || formData.despesas.length === 0 ? (
          <div className="text-center py-8">
            <Receipt size={48} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400">Nenhuma despesa cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-600">
                <tr className="text-gray-400">
                  <th className="p-3 font-medium">Data</th>
                  <th className="p-3 font-medium">Categoria</th>
                  <th className="p-3 font-medium">Descrição</th>
                  <th className="p-3 font-medium">Pago Por</th>
                  <th className="p-3 font-medium">Comprovante</th>
                  <th className="p-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {formData.despesas.map((despesa, index) => (
                  <tr key={despesa.id || index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="p-3 text-gray-300">{formatDate(despesa.data)}</td>
                    <td className="p-3 text-gray-300">{despesa.categoria}</td>
                    <td className="p-3 text-white">{despesa.descricao}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        despesa.pago_por === 'Tripulante' ? 'bg-blue-500/20 text-blue-400' :
                        despesa.pago_por === 'Cotista' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {despesa.pago_por}
                      </span>
                    </td>
                    <td className="p-3">
                      {despesa.comprovante_url ? (
                        <a 
                          href={despesa.comprovante_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Ver arquivo
                        </a>
                      ) : despesa.comprovante_nome ? (
                        <span className="text-gray-400">{despesa.comprovante_nome}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium text-green-400">
                      {formatCurrency(despesa.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção inferior com Observações e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Observações */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText size={20} className="text-yellow-400"/>
            Observações
          </h3>
          <div className="text-gray-300 text-sm leading-relaxed">
            {formData.observacoes && formData.observacoes.trim() ? (
              <p className="whitespace-pre-wrap">{formData.observacoes}</p>
            ) : (
              <p className="text-gray-500 italic">Nenhuma observação adicionada.</p>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Receipt size={20} className="text-green-400"/>
            Resumo Financeiro
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Tripulante:</span>
              <span className="font-medium text-blue-400">
                {formatCurrency(calculatedTotals.total_tripulante)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Cotista:</span>
              <span className="font-medium text-green-400">
                {formatCurrency(calculatedTotals.total_cotista)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Share Brasil:</span>
              <span className="font-medium text-purple-400">
                {formatCurrency(calculatedTotals.total_share_brasil)}
              </span>
            </div>
            <hr className="border-gray-600 my-3" />
            <div className="flex justify-between items-center text-base">
              <span className="font-bold text-white">TOTAL GERAL:</span>
              <span className="font-bold text-xl text-cyan-400">
                {formatCurrency(calculatedTotals.valor_total)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botões de Ação */}
      {!isViewingSavedReport && (
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <button 
            type="button" 
            onClick={() => setViewMode('form')} 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-600 hover:bg-gray-700 transition-colors h-10 px-6 text-gray-300"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Voltar e Editar
          </button>
          
          {handleSubmit && (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white h-10 px-6"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 w-4 h-4" />
                  Confirmar e Salvar
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};