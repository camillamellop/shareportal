import { jsPDF } from "jspdf";
import "jspdf-autotable";

// --- Tipos de Dados (Alinhados com o componente React) ---
export interface DespesaViagem { 
    id: string; 
    categoria: string; 
    descricao: string; 
    valor: number; 
    data: string; 
    pago_por: 'Tripulante' | 'Cotista' | 'Share Brasil'; 
    comprovante_url?: string; 
    comprovante_nome?: string; 
}

export interface RelatorioViagemForm { 
    numero: string; 
    cotista: string; 
    aeronave: string; 
    tripulante: string; 
    destino: string; 
    data_inicio: string; 
    data_fim: string; 
    despesas: DespesaViagem[]; 
    observacoes: string; 
}

export interface EmpresaInfo {
    razaoSocial: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
}

// --- Configurações de Tema e Layout ---
const THEME = {
    BACKGROUND: '#031741ff', // bg-gray-900
    CARD: '#0f284bff',       // bg-gray-800
    BORDER: '#374151',     // border-gray-700
    TEXT_PRIMARY: '#e5e9eeff', // text-white / gray-50
    TEXT_SECONDARY: '#9CA3AF', // text-gray-400
    PRIMARY: '#2e70c7da',    // cyan-500
    GREEN: '#28aa7aff',      // green-400
    BLUE: '#60A5FA',       // blue-400
    PURPLE: '#A78BFA',     // purple-400
};

const MARGIN = 40;

// --- Funções Utilitárias ---
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brDate = (d: string | Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: 'UTC' });

// --- Funções de Desenho do PDF ---

function addHeaderAndBackground(doc: jsPDF, empresa: EmpresaInfo) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fundo da página
    doc.setFillColor(THEME.BACKGROUND);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Cabeçalho
    const logoUrl = "https://i.ibb.co/qL88CDcV/Logo-Share.png";
    doc.addImage(logoUrl, "PNG", pageWidth - MARGIN - 100, MARGIN - 10, 100, 40, "", "FAST");

    doc.setFontSize(9);
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text(empresa.razaoSocial, MARGIN, MARGIN);
    doc.text(`CNPJ: ${empresa.cnpj}`, MARGIN, MARGIN + 12);
    doc.text(empresa.endereco, MARGIN, MARGIN + 24);
    doc.text(`${empresa.cidade}, ${empresa.estado} - CEP: ${empresa.cep}`, MARGIN, MARGIN + 36);

    // Linha separadora
    doc.setDrawColor(THEME.BORDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, MARGIN + 50, pageWidth - MARGIN, MARGIN + 50);
}

function addReportInfo(doc: jsPDF, relatorio: RelatorioViagemForm) {
    let y = MARGIN + 80;

    // Título Principal
    doc.setFontSize(18);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(`Relatório Despesa de Viagem: ${relatorio.numero}`, MARGIN, y);
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(THEME.PRIMARY);
    doc.text(relatorio.destino, MARGIN, y);
    y += 25;

    // Detalhes em colunas
    doc.setFontSize(10);
    const col1X = MARGIN;
    const col2X = 250;
    const col3X = 430;

    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Cotista", col1X, y);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(relatorio.cotista, col1X, y + 12);

    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Tripulante", col2X, y);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(relatorio.tripulante, col2X, y + 12);
    
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Aeronave", col3X, y);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(relatorio.aeronave, col3X, y + 12);
    
    y += 30;

    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Período", col1X, y);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(`${brDate(relatorio.data_inicio)} a ${brDate(relatorio.data_fim)}`, col1X, y + 12);

    return y + 30;
}

function addExpensesTable(doc: jsPDF, despesas: DespesaViagem[], startY: number) {
    // @ts-ignore
    doc.autoTable({
        startY,
        margin: { left: MARGIN, right: MARGIN },
        theme: 'plain',
        styles: {
            fillColor: THEME.CARD,
            textColor: THEME.TEXT_SECONDARY,
            lineColor: THEME.BORDER,
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: THEME.BACKGROUND,
            textColor: THEME.TEXT_PRIMARY,
            fontStyle: 'bold',
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: '#1f2937e0', // Um pouco diferente do CARD
        },
        head: [["Data", "Categoria", "Descrição", "Pago Por", { content: "Valor", styles: { halign: 'right' } }]],
        body: despesas.map(d => [
            brDate(d.data),
            d.categoria,
            d.descricao,
            d.pago_por,
            { content: brl(d.valor), styles: { halign: 'right', textColor: THEME.GREEN } }
        ]),
        didDrawPage: (data) => {
            // Adiciona fundo em cada nova página da tabela
            doc.setFillColor(THEME.BACKGROUND);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
        }
    });
    return (doc as any).lastAutoTable.finalY;
}

function addTotalsAndSignature(doc: jsPDF, totals: any, observacoes: string, startY: number) {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = startY + 20;

    // Card de Resumo Financeiro
    doc.setFillColor(THEME.BACKGROUND);
    doc.setDrawColor(THEME.BORDER);
    doc.roundedRect(MARGIN, y, pageWidth - (MARGIN * 2), 60, 5, 5, 'FD');
    y += 20;

    const col1 = MARGIN + 15;
    const col2 = MARGIN + 150;
    const col3 = MARGIN + 280;
    const col4 = pageWidth - MARGIN - 15;

    doc.setFontSize(9);
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Total Tripulante:", col1, y);
    doc.setFontSize(12);
    doc.setTextColor(THEME.BLUE);
    doc.text(brl(totals.total_tripulante), col1, y + 15);

    doc.setFontSize(9);
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Total Cotista:", col2, y);
    doc.setFontSize(12);
    doc.setTextColor(THEME.GREEN);
    doc.text(brl(totals.total_cotista), col2, y + 15);

    doc.setFontSize(9);
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Total Share Brasil:", col3, y);
    doc.setFontSize(12);
    doc.setTextColor(THEME.PURPLE);
    doc.text(brl(totals.total_share_brasil), col3, y + 15);

    doc.setFontSize(10);
    doc.setTextColor(THEME.TEXT_SECONDARY);
    doc.text("Total Geral:", col4, y, { align: 'right' });
    doc.setFontSize(16);
    doc.setTextColor(THEME.TEXT_PRIMARY);
    doc.text(brl(totals.valor_total), col4, y + 18, { align: 'right' });

    y += 60;

    if (observacoes) {
        doc.setTextColor(THEME.TEXT_SECONDARY);
        doc.setFontSize(10);
        doc.text("Observações:", MARGIN, y);
        y += 15;
        doc.setTextColor(THEME.TEXT_PRIMARY);
        doc.setFontSize(9);
        doc.text(observacoes, MARGIN, y, { maxWidth: pageWidth - (MARGIN * 2) });
    }
}

// --- Função Principal ---
export async function generateRelatorioViagemPDF(
  relatorio: RelatorioViagemForm,
  totals: any,
  empresa: EmpresaInfo,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Página 1
  addHeaderAndBackground(doc, empresa);
  const yAfterInfo = addReportInfo(doc, relatorio);
  const yAfterTable = addExpensesTable(doc, relatorio.despesas, yAfterInfo);
  addTotalsAndSignature(doc, totals, relatorio.observacoes, yAfterTable);
  
  // Nome do arquivo
  doc.save(`${relatorio.numero}_${relatorio.cotista}.pdf`);
}

