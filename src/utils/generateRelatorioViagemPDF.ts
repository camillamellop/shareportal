// utils/generateRelatorioViagemPDF.ts
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

type StatusRelatorio = 'RASCUNHO' | 'SALVO' | 'ENVIADO' | 'EXCLUIDO';

export interface DespesaViagem {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string; // ISO (yyyy-mm-dd)
  pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil';
  comprovante_url?: string;
  comprovante_nome?: string;
}

export interface RelatorioViagem {
  id?: string;
  numero: string;
  cotista: string;
  matricula: string;
  tripulante: string;
  destino: string;
  data_inicio: any;
  data_fim: any;
  despesas: DespesaViagem[];
  observacoes: string;
  status?: StatusRelatorio;
  criado_por?: string;
  total_tripulante?: number;
  total_cotista?: number;
  total_share_brasil?: number;
  valor_total?: number;
  prefixo_cotista: string;
}

export interface CompanyConfigLike {
  nome?: string;
  cnpj?: string;
  inscricao_municipal?: string;
  endereco_linha?: string; // ex: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase, Várzea Grande - MT, 78125-100"
  logo_url?: string;        // URL pública do logo
}

export interface Totals {
  total_tripulante: number;
  total_cotista: number;
  total_share_brasil: number;
  valor_total: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const formatDate = (d: any) => {
  const date = d?.toDate ? d.toDate() : new Date(d);
  if (isNaN(date.getTime())) return "—";
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString("pt-BR");
};

async function fetchAsDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateRelatorioViagemPDF(
  relatorio: RelatorioViagem,
  totals: Totals,
  companyConfig: CompanyConfigLike
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842 pt
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 36; // ~ 0.5"
  let cursorY = 36;

  // Paleta parecida com o preview
  const bgDark = "#0f172a";       // slate-900-ish
  const cardDark = "#111827";     // gray-900
  const textLight = "#e5e7eb";    // gray-200
  const textMuted = "#9ca3af";    // gray-400
  const accent = "#38bdf8";       // cyan-400
  const border = "#334155";       // slate-700

  // ===== Cabeçalho "card" com logo e dados empresa =====
  // Caixa arredondada
  doc.setFillColor(cardDark);
  roundedRect(doc, marginX, cursorY, pageWidth - marginX * 2, 92, 10, true, false);
  const headerPadding = 14;
  cursorY += headerPadding;

  // Logo (opcional)
  let logoH = 0;
  if (companyConfig?.logo_url) {
    const dataUrl = await fetchAsDataURL(companyConfig.logo_url);
    if (dataUrl) {
      const logoW = 110;
      logoH = 32;
      doc.addImage(dataUrl, "PNG", pageWidth - marginX - headerPadding - logoW, cursorY, logoW, logoH, undefined, "FAST");
    }
  }

  // Texto do cabeçalho
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(textLight);
  doc.text(companyConfig?.nome || "—", marginX + headerPadding, cursorY + 14);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(textMuted);
  const l2 = [];
  if (companyConfig?.cnpj) l2.push(`CNPJ: ${companyConfig.cnpj}`);
  if (companyConfig?.inscricao_municipal) l2.push(`IM: ${companyConfig.inscricao_municipal}`);
  if (l2.length) doc.text(l2.join(" • "), marginX + headerPadding, cursorY + 32);
  if (companyConfig?.endereco_linha)
    doc.text(companyConfig.endereco_linha, marginX + headerPadding, cursorY + 50);

  cursorY = 36 + 92 + 16;

  // ===== Título (como no preview) =====
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(textLight);
  doc.text(`Pré-visualização — Relatório #${relatorio.numero || "—"}`, marginX, cursorY);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(textMuted);
  doc.text("Confira os dados abaixo. Você pode voltar e editar, ou salvar e baixar o PDF.", marginX, cursorY + 16);

  cursorY += 28;

  // ===== Card com informações principais =====
  const infoCardTop = cursorY + 8;
  const infoCardH = 110;
  doc.setFillColor(bgDark);
  roundedRect(doc, marginX, infoCardTop, pageWidth - marginX * 2, infoCardH, 10, true, true, border);

  // Labels & valores (três colunas)
  const colW = (pageWidth - marginX * 2 - 32) / 3; // padding interno 16*2
  const colX = (i: number) => marginX + 16 + i * colW;
  const line1Y = infoCardTop + 22;
  const line2Y = line1Y + 18;
  const line3Y = line2Y + 18;

  doc.setFontSize(9).setTextColor(textMuted);

  // Linha 1
  doc.text("Cotista:", colX(0), line1Y);
  doc.text("Aeronave:", colX(1), line1Y);
  doc.text("Tripulante:", colX(2), line1Y);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(textLight);
  doc.text(relatorio.cotista || "—", colX(0), line2Y);
  doc.text(relatorio.matricula || "—", colX(1), line2Y);
  doc.text(relatorio.tripulante || "—", colX(2), line2Y);

  // Linha 2
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(textMuted);
  doc.text("Destino:", colX(0), line3Y);
  doc.text("Período:", colX(1), line3Y);
  doc.text("Número:", colX(2), line3Y);

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(textLight);
  doc.text(relatorio.destino || "—", colX(0), line3Y + 16);
  const periodo = `${formatDate(relatorio.data_inicio)} a ${formatDate(relatorio.data_fim)}`;
  doc.text(periodo, colX(1), line3Y + 16);
  doc.text(relatorio.numero || "—", colX(2), line3Y + 16);

  cursorY = infoCardTop + infoCardH + 22;

  // ===== Título "Despesas (N)" =====
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(textLight);
  doc.text(`Despesas (${relatorio.despesas?.length || 0})`, marginX, cursorY);
  cursorY += 8;

  // ===== Tabela de despesas =====
  const bodyRows: RowInput[] = (relatorio.despesas || []).map((d) => {
    const linkText = d.comprovante_url ? "abrir" : "—";
    return [
      formatDate(d.data),
      d.categoria || "—",
      d.descricao || "—",
      d.pago_por || "—",
      linkText,
      formatCurrency(d.valor || 0),
    ];
  });

  autoTable(doc, {
    startY: cursorY + 6,
    margin: { left: marginX, right: marginX },
    styles: {
      font: "helvetica",
      fontSize: 10,
      textColor: textLight,
      fillColor: bgDark,
      lineColor: border,
      lineWidth: 0.7,
      cellPadding: 6,
      valign: "middle",
    },
    headStyles: {
      fillColor: cardDark,
      textColor: textLight,
      halign: "left",
      fontStyle: "bold",
    },
    bodyStyles: {
      fillColor: bgDark,
      textColor: textLight,
    },
    alternateRowStyles: { fillColor: "#0b1220" },
    columnStyles: {
      0: { cellWidth: 90 },   // Data
      1: { cellWidth: 110 },  // Categoria
      2: { cellWidth: 200 },  // Descrição
      3: { cellWidth: 90 },   // Pago por
      4: { cellWidth: 70 },   // Comprovante
      5: { cellWidth: 90, halign: "right" }, // Valor
    },
    head: [[ "Data", "Categoria", "Descrição", "Pago por", "Comprovante", "Valor" ]],
    body: bodyRows,
    didDrawCell: (data) => {
      // Tornar a célula "Comprovante" clicável quando existir URL
      if (data.section === "body" && data.column.index === 4) {
        const row = relatorio.despesas[data.row.index];
        if (row?.comprovante_url) {
          const { cell } = data;
          const linkX = cell.x + 2;
          const linkY = cell.y + 10;
          doc.setTextColor(accent);
          doc.textWithLink("abrir", linkX, linkY, { url: row.comprovante_url });
          doc.setTextColor(textLight);
        }
      }
    },
  });

  let afterTableY = (doc as any).lastAutoTable.finalY || cursorY + 40;

  // ===== Totais (caixa à direita) =====
  const totalsW = 240;
  const totalsH = 92;
  const totalsX = pageWidth - marginX - totalsW;
  const totalsY = afterTableY + 14;

  doc.setFillColor(cardDark);
  roundedRect(doc, totalsX, totalsY, totalsW, totalsH, 10, true, true, border);

  const line = (label: string, value: string, y: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(bold ? 12 : 10);
    doc.setTextColor(bold ? accent : textLight);
    doc.text(label, totalsX + 12, y);
    doc.text(value, totalsX + totalsW - 12, y, { align: "right" as const });
  };

  line("Tripulante:", formatCurrency(totals.total_tripulante), totalsY + 24);
  line("Cotista:", formatCurrency(totals.total_cotista), totalsY + 44);
  line("Share Brasil:", formatCurrency(totals.total_share_brasil), totalsY + 64);
  line("Total:", formatCurrency(totals.valor_total), totalsY + 84, true);

  // ===== Observações (se houver) =====
  const obs = (relatorio.observacoes || "").trim();
  if (obs) {
    const obsTop = totalsY + totalsH + 18;
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(textLight);
    doc.text("Observações", marginX, obsTop);
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(textLight);
    multiLineText(doc, obs, marginX, obsTop + 12, pageWidth - marginX * 2);
  }

  // ===== Saída =====
  const filename = `Relatorio-${relatorio.numero || "sem-numero"}.pdf`;
  const blob = doc.output("blob") as Blob;
  return { blob, filename };
}

/** Helpers visuais */

function roundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill = false,
  stroke = false,
  strokeColor?: string
) {
  if (stroke && strokeColor) {
    const c = hexToRgb(strokeColor);
    if (c) doc.setDrawColor(c.r, c.g, c.b);
  }
  (doc as any).roundedRect(x, y, w, h, r, r, fill ? "F" : stroke ? "S" : "N");
}

function multiLineText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines as unknown as string, x, y);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}
