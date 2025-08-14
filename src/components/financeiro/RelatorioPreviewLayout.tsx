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
  totals: { total_tripulante: number; total_cotista: number; total_share_brasil: number; valor_total: number; };
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
    <div className="w-full flex justify-center">
      {/* Página A4 (≈ 794px a 96dpi) */}
      <div
        className="
          w-[794px] max-w-full bg-white text-gray-900
          rounded-xl shadow ring-1 ring-gray-200
          p-8 space-y-8
          print:w-[794px] print:rounded-none print:shadow-none print:ring-0 print:p-8
        "
      >
        {/* ===== Cabeçalho ===== */}
        <div
          className="grid grid-cols-[1fr_auto] gap-6 items-start"
          style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight uppercase">
              {dadosEmpresa?.razaoSocial || "Empresa"}
            </h1>
            <p className="text-sm">
              CNPJ: {dadosEmpresa?.cnpj || "–"}
              {dadosEmpresa?.inscricaoMunicipal ? ` • IM: ${dadosEmpresa.inscricaoMunicipal}` : ""}
            </p>
            <p className="text-sm">
              Endereço: {dadosEmpresa?.endereco || "–"},{" "}
              {dadosEmpresa?.cidade || "–"} – {dadosEmpresa?.estado || "–"}
              {dadosEmpresa?.cep ? `, ${dadosEmpresa.cep}` : ""}
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

          {dadosEmpresa?.logo && (
            <img
              src={dadosEmpresa.logo}
              alt="Logo"
              className="h-16 w-auto object-contain justify-self-end"
            />
          )}
        </div>

        {/* Linha divisória leve */}
        <hr className="border-gray-200" />

        {/* Título + Status */}
        <div className="flex items-center justify-between" style={{ breakInside: "avoid" }}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Relatório #{formData?.numero || "—"}
            </h2>
            <p className="text-sm text-gray-500">
              Pré-visualização do documento antes da geração do PDF.
            </p>
          </div>
          {status && (
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {status}
            </Badge>
          )}
        </div>

        {/* ===== Cards de Metadados ===== */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          style={{ breakInside: "avoid" }}
        >
          {[
            { label: "Cotista", value: formData.cotista || "—" },
            { label: "Aeronave", value: formData.aeronave || "—" },
            { label: "Tripulante", value: formData.tripulante || "—" },
            { label: "Destino", value: formData.destino || "—" },
            { label: "Período", value: `${formatDate(formData.data_inicio)} a ${formatDate(formData.data_fim)}` },
            { label: "Número", value: formData.numero || "—" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                {item.label}
              </div>
              <div className="mt-1 font-semibold">{item.value}</div>
            </div>
          ))}
        </section>

        {/* ===== Despesas ===== */}
        <section className="space-y-4" style={{ breakInside: "avoid" }}>
          <h3 className="text-lg font-semibold">
            Despesas ({formData?.despesas?.length || 0})
          </h3>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600">
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-left">Descrição</th>
                  <th className="p-3 text-left">Pago por</th>
                  <th className="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(formData?.despesas || []).map((d: DespesaViagem) => (
                  <tr key={d.id} className="bg-white">
                    <td className="p-3 text-gray-700 whitespace-nowrap">{formatDate(d.data)}</td>
                    <td className="p-3 text-gray-700">{d.categoria}</td>
                    <td className="p-3 text-gray-900">{d.descricao}</td>
                    <td className="p-3 text-gray-700">{d.pago_por}</td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(d.valor)}
                    </td>
                  </tr>
                ))}
                {(!formData?.despesas || formData?.despesas.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Nenhuma despesa adicionada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            style={{ breakInside: "avoid" }}
          >
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <ul className="text-sm space-y-1">
                <li className="text-gray-700">
                  Tripulante:{" "}
                  <span className="font-semibold">
                    {formatCurrency(totals.total_tripulante)}
                  </span>
                </li>
                <li className="text-gray-700">
                  Cotista:{" "}
                  <span className="font-semibold">
                    {formatCurrency(totals.total_cotista)}
                  </span>
                </li>
                <li className="text-gray-700">
                  Share Brasil:{" "}
                  <span className="font-semibold">
                    {formatCurrency(totals.total_share_brasil)}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between md:justify-end">
              <div className="text-lg font-bold">
                Total: {formatCurrency(totals.valor_total)}
              </div>
            </div>
          </div>

          {/* Observações */}
          {formData?.observacoes && (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              style={{ breakInside: "avoid" }}
            >
              <h4 className="font-semibold mb-2">Observações</h4>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {formData.observacoes}
              </p>
            </div>
          )}
        </section>

        {/* ===== Ações (somente na tela; ocultas no print/PDF via navegador) ===== */}
        <div className="flex flex-col md:flex-row gap-3 justify-end print:hidden">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar e editar
          </Button>
          <Button onClick={onSaveAndPdf} disabled={isSubmitting} className="gap-2">
            <Download className="w-4 h-4" /> Salvar & Baixar PDF
          </Button>
        </div>

        <p className="text-xs text-gray-500 print:hidden">
          Obs.: No PDF final, o cabeçalho aparece nesta primeira página; anexos/comprovantes podem ir em páginas seguintes.
        </p>
      </div>
    </div>
  );
};
