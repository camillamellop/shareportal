import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

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

interface CompanyConfig {
  razaoSocial: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

interface RelatorioViagemForm {
  numero: string;
  cotista: string;
  aeronave: string;
  tripulante: string;
  destino: string;
  data_inicio: string;
  data_fim: string;
  despesas: DespesaViagem[];
  observacoes: string;
  criado_por: string;
  prefixo_cotista: string;
}

interface Props {
  dadosEmpresa: CompanyConfig;
  formData: RelatorioViagemForm | any;
  totals: { 
    total_tripulante: number; 
    total_cotista: number; 
    total_share_brasil: number; 
    valor_total: number; 
  };
  formatDate: (d: any) => string;
  formatCurrency: (n: number) => string;
  isSubmitting?: boolean;
  onBack?: () => void;
  onSaveAndPdf?: () => void;
  status?: string;
}

export const RelatorioPreviewLayout: React.FC<Props> = ({
  dadosEmpresa,
  formData,
  totals,
  formatDate,
  formatCurrency,
  isSubmitting,
  onBack,
  onSaveAndPdf,
  status
}) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho padrão */}
      <div className="bg-white text-gray-900 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{dadosEmpresa?.razaoSocial || "Empresa"}</h2>
            <p className="text-sm mt-1">
              CNPJ: {dadosEmpresa?.cnpj || "-"}{dadosEmpresa?.inscricaoMunicipal ? ` • IM: ${dadosEmpresa.inscricaoMunicipal}` : ""}
            </p>
            <p className="text-sm">
              Endereço: {dadosEmpresa?.endereco || "-"}, {dadosEmpresa?.cidade || "-"} - {dadosEmpresa?.estado || "-"}{dadosEmpresa?.cep ? `, ${dadosEmpresa.cep}` : ""}
            </p>
            {(dadosEmpresa?.telefone || dadosEmpresa?.email || dadosEmpresa?.website) && (
              <p className="text-sm">
                {dadosEmpresa?.telefone ? `Tel: ${dadosEmpresa.telefone}` : ""}
                {dadosEmpresa?.telefone && dadosEmpresa?.email ? " • " : ""}
                {dadosEmpresa?.email ? `E-mail: ${dadosEmpresa.email}` : ""}
                {(dadosEmpresa?.telefone || dadosEmpresa?.email) && dadosEmpresa?.website ? " • " : ""}
                {dadosEmpresa?.website ? `Site: ${dadosEmpresa.website}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Título + status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Pré-visualização — Relatório #{formData?.numero || "—"}
          </h1>
          <p className="text-gray-400 text-sm">
            Confira os dados abaixo. Você pode voltar e editar, ou salvar e baixar o PDF.
          </p>
        </div>
        {status && (
          <Badge variant="outline" className="border-gray-600 text-gray-200">
            {status}
          </Badge>
        )}
      </div>

      {/* Bloco de informações */}
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div><span className="text-gray-400">Cotista:</span> <span className="text-white font-medium">{formData.cotista || "—"}</span></div>
          <div><span className="text-gray-400">Aeronave:</span> <span className="text-white font-medium">{formData.aeronave || "—"}</span></div>
          <div><span className="text-gray-400">Tripulante:</span> <span className="text-white font-medium">{formData.tripulante || "—"}</span></div>
          <div><span className="text-gray-400">Destino:</span> <span className="text-white font-medium">{formData.destino || "—"}</span></div>
          <div><span className="text-gray-400">Período:</span> <span className="text-white font-medium">{formatDate(formData.data_inicio)} a {formatDate(formData.data_fim)}</span></div>
          <div><span className="text-gray-400">Número:</span> <span className="text-white font-medium">{formData.numero || "—"}</span></div>
        </div>

        {/* Despesas */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Despesas ({formData?.despesas?.length || 0})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-600">
                <tr className="text-gray-400">
                  <th className="p-3">Data</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Pago por</th>
                  <th className="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {(formData?.despesas || []).map((d: DespesaViagem) => (
                  <tr key={d.id} className="border-b border-gray-700">
                    <td className="p-3 text-gray-300">{formatDate(d.data)}</td>
                    <td className="p-3 text-gray-300">{d.categoria}</td>
                    <td className="p-3 text-white">{d.descricao}</td>
                    <td className="p-3 text-gray-300">{d.pago_por}</td>
                    <td className="p-3 text-right text-green-400 font-medium">{formatCurrency(d.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="mt-4 p-4 bg-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 text-sm">
              <div className="text-gray-300">Tripulante: <span className="text-white font-medium">{formatCurrency(totals.total_tripulante)}</span></div>
              <div className="text-gray-300">Cotista: <span className="text-white font-medium">{formatCurrency(totals.total_cotista)}</span></div>
              <div className="text-gray-300">Share Brasil: <span className="text-white font-medium">{formatCurrency(totals.total_share_brasil)}</span></div>
            </div>
            <div className="text-right text-lg text-cyan-400 font-bold">
              Total: {formatCurrency(totals.valor_total)}
            </div>
          </div>

          {/* Observações */}
          {formData?.observacoes && (
            <div className="mt-4 p-4 bg-gray-700/60 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Observações</h4>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{formData.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col md:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar e editar
        </Button>
        <Button onClick={onSaveAndPdf} disabled={isSubmitting} className="gap-2">
          <Download className="w-4 h-4" /> Salvar & Baixar PDF
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Obs.: O PDF terá o cabeçalho da empresa na primeira página e, na segunda, os comprovantes anexados (imagens).
        Comprovantes PDF aparecem listados como link.
      </p>
    </div>
  );
};
