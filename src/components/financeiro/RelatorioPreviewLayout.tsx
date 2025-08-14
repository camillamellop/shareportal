import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Edit } from "lucide-react";

interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
  comprovante_nome?: string;
}

interface DadosEmpresa {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface Totals {
  total_tripulante: number;
  total_cotista: number;
  total_share_brasil: number;
  valor_total: number;
}

interface FormData {
  numero: string;
  destino: string;
  cotista: string;
  tripulante: string;
  aeronave: string;
  data_inicio: string;
  data_fim: string;
  observacoes?: string;
  despesas: DespesaViagem[];
}

type ViewMode = 'form' | 'preview';
interface RelatorioViagemPreviewProps {
  dadosEmpresa: DadosEmpresa;
  formData: FormData;
  totals: Totals;
  formatDate: (date: string) => string;
  formatCurrency: (value: number) => string;
  setViewMode: (mode: ViewMode) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  status?: string;
}

export const RelatorioPreviewLayout: React.FC<RelatorioViagemPreviewProps> = ({
  dadosEmpresa,
  formData,
  totals,
  formatDate,
  formatCurrency,
  setViewMode,
  handleSubmit,
  isSubmitting,
  status
}) => {
  if (!formData) return null;

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardContent className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Pré-visualização do Relatório</h1>
          <p className="text-gray-400">Confira todos os dados antes de salvar.</p>
        </div>

        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4">
          <div className="text-sm text-gray-300">
            <p className="font-bold text-white text-base">{dadosEmpresa.razaoSocial}</p>
            <p>CNPJ: {dadosEmpresa.cnpj}</p>
            <p>{dadosEmpresa.endereco}</p>
            <p>{dadosEmpresa.cidade}, {dadosEmpresa.estado} - CEP: {dadosEmpresa.cep}</p>
          </div>
          <img
            src="https://i.ibb.co/qL88CDcV/Logo-Share.png"
            alt="Logo da Empresa"
            className="w-32 h-auto"
          />
        </div>

        {/* Informações principais */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            {formData.numero} - {formData.destino}
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div><p className="text-gray-400">Cotista</p><p className="text-white font-medium">{formData.cotista}</p></div>
            <div><p className="text-gray-400">Tripulante</p><p className="text-white font-medium">{formData.tripulante}</p></div>
            <div><p className="text-gray-400">Aeronave</p><p className="text-white font-medium">{formData.aeronave}</p></div>
            <div><p className="text-gray-400">Período</p><p className="text-white font-medium">{formatDate(formData.data_inicio)} a {formatDate(formData.data_fim)}</p></div>
          </div>
          {formData.observacoes && (
            <div className="mt-4">
              <p className="text-gray-400">Observações</p>
              <p className="text-white whitespace-pre-wrap">{formData.observacoes}</p>
            </div>
          )}
        </div>

        {/* Despesas */}
        <div>
          <h4 className="font-medium text-white mb-3">
            Despesas Adicionadas ({formData.despesas.length})
          </h4>
          <div className="space-y-3">
            {formData.despesas.map(d => (
              <div key={d.id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">{d.descricao}</p>
                  <p className="text-xs text-gray-400">
                    {d.categoria} - {formatDate(d.data)} - Pago por: {d.pago_por}
                  </p>
                </div>
                <p className="font-medium text-green-400">{formatCurrency(d.valor)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h5 className="font-medium mb-2 text-white">Resumo Financeiro</h5>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-400">Tripulante:</span><p className="font-medium text-blue-400 text-lg">{formatCurrency(totals.total_tripulante)}</p></div>
            <div><span className="text-gray-400">Cotista:</span><p className="font-medium text-green-400 text-lg">{formatCurrency(totals.total_cotista)}</p></div>
            <div><span className="text-gray-400">Share Brasil:</span><p className="font-medium text-purple-400 text-lg">{formatCurrency(totals.total_share_brasil)}</p></div>
            <div className="font-semibold text-white">
              <span className="text-gray-300">Total Geral:</span>
              <p className="text-2xl">{formatCurrency(totals.valor_total)}</p>
            </div>
          </div>
        </div>

        {/* Botões */}
        {status === 'RASCUNHO' && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-200 h-10 py-2 px-4"
            >
              <Edit className="mr-2 w-4 h-4" /> Voltar e Editar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white h-10 py-2 px-4 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 w-4 h-4" /> {isSubmitting ? 'Salvando...' : 'Confirmar e Salvar'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
