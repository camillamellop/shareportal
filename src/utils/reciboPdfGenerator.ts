import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Supondo que você tenha uma função para converter número em extenso.
// Se não tiver, você pode usar uma biblioteca como 'numero-por-extenso'.
// Ex: import { porExtenso } from 'numero-por-extenso';
function valorPorExtenso(numero: number): string {
    // Implementação da sua função ou de uma biblioteca
    // Placeholder para o código funcionar:
    return `(Valor por extenso de ${numero.toFixed(2)})`;
}


// --- Tipos de Dados para o Recibo ---

export interface EmpresaInfo {
    razaoSocial: string;
    cnpj: string;
    telefone?: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
    logoUrl?: string; // URL da logo
}

export interface PagadorInfo {
    nome: string;
    documento: string; // CNPJ ou CPF
}

export interface ItemRecibo {
    descricao: string;
    quantidade: number;
    preco: number;
    total: number;
}

export interface ReciboData {
    numero: string;
    dataEmissao: string | Date;
    pagador: PagadorInfo;
    itens: ItemRecibo[];
    observacao?: string;
    subtotal: number;
    desconto: number;
    total: number;
}

// --- Funções Utilitárias ---
const brl = (n: number) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brDate = (d: string | Date) => new Date(d).toLocaleDateString("pt-BR", { timeZone: 'UTC' });

// --- Funções de Desenho do PDF ---

function addHeader(doc: jsPDF, empresa: EmpresaInfo) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    if (empresa.logoUrl) {
        // Adiciona a logo no canto superior esquerdo
        doc.addImage(empresa.logoUrl, "PNG", margin, margin - 15, 80, 30, "", "FAST");
    }

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGAMENTO", pageWidth / 2, margin + 10, { align: "center" });
}

function addDadosPrincipais(doc: jsPDF, recibo: ReciboData, empresa: EmpresaInfo) {
    const margin = 40;
    let y = margin + 50;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
    y += 20;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");

    // Coluna Emissor
    doc.text("Emissor", margin, y);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text(empresa.razaoSocial, margin, y + 12);
    doc.text(`CNPJ: ${empresa.cnpj}`, margin, y + 22);
    if (empresa.telefone) doc.text(`Tel: ${empresa.telefone}`, margin, y + 32);
    doc.text(empresa.endereco, margin, y + 42);
    doc.text(`${empresa.cidade}, ${empresa.estado} - ${empresa.cep}`, margin, y + 52);

    // Coluna Pagador
    const col2X = 250;
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.text("Pagador", col2X, y);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    const pagadorNomeLines = doc.splitTextToSize(recibo.pagador.nome, 180);
    doc.text(pagadorNomeLines, col2X, y + 12);
    const pagadorYOffset = (pagadorNomeLines.length * 10);
    doc.text(`CNPJ/CPF: ${recibo.pagador.documento}`, col2X, y + 12 + pagadorYOffset);

    // Coluna Valor e Número
    const col3X = doc.internal.pageSize.getWidth() - margin;
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(col3X - 120, y - 10, 120, 50, 5, 5, 'FD');

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(brl(recibo.total), col3X - 10, y + 10, { align: "right" });
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Número do recibo:", col3X - 10, y + 30, { align: "right" });
    doc.setTextColor(50, 50, 50);
    doc.text(recibo.numero, col3X - 10, y + 40, { align: "right" });

    return y + 80;
}

function addTabelaItens(doc: jsPDF, itens: ItemRecibo[], startY: number) {
    // @ts-ignore
    doc.autoTable({
        startY,
        margin: { left: 40, right: 40 },
        theme: 'grid',
        styles: { fontSize: 9, textColor: [50, 50, 50], lineColor: [220, 220, 220] },
        headStyles: { fillColor: [245, 245, 245], textColor: [100, 100, 100], fontStyle: 'bold' },
        bodyStyles: { cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 280 }, // Descrição
            1: { halign: 'center' }, // Quant.
            2: { halign: 'right' }, // Preço
            3: { halign: 'right' }, // Total
        },
        head: [["DESCRIÇÃO", "QUANT.", "PREÇO", "TOTAL"]],
        body: itens.map(item => [
            item.descricao,
            item.quantidade,
            brl(item.preco),
            brl(item.total)
        ]),
    });
    return (doc as any).lastAutoTable.finalY;
}

function addTotaisDeclaracao(doc: jsPDF, recibo: ReciboData, empresa: EmpresaInfo, startY: number) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = startY + 15;
    const rightColX = pageWidth - margin;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal:", rightColX - 100, y);
    doc.setTextColor(50, 50, 50);
    doc.text(brl(recibo.subtotal), rightColX, y, { align: 'right' });
    y += 15;

    doc.setTextColor(100, 100, 100);
    doc.text("Desconto:", rightColX - 100, y);
    doc.setTextColor(50, 50, 50);
    doc.text(brl(recibo.desconto), rightColX, y, { align: 'right' });
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Total:", rightColX - 100, y);
    doc.setTextColor(0, 0, 0);
    doc.text(brl(recibo.total), rightColX, y, { align: 'right' });
    y += 30;

    // Observação
    if (recibo.observacao) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text("Observação:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const obsLines = doc.splitTextToSize(recibo.observacao, pageWidth - (margin * 2));
        doc.text(obsLines, margin, y + 12);
        y += (obsLines.length * 10) + 20;
    }

    // Declaração
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("Declaração:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const declaracaoText = `Recebemos de ${recibo.pagador.nome}, a importância de ${valorPorExtenso(recibo.total)}, referente aos itens listados acima. Para maior clareza, firmo o presente recibo para que produza seus efeitos, dando plena, geral e irrevogável quitação pelo valor recebido.`;
    const declaracaoLines = doc.splitTextToSize(declaracaoText, pageWidth - (margin * 2));
    doc.text(declaracaoLines, margin, y + 12, { lineHeightFactor: 1.5 });
    y += (declaracaoLines.length * 10 * 1.5) + 40;
    
    // Assinatura e Data
    const centerX = pageWidth / 2;
    doc.line(centerX - 120, y, centerX + 120, y);
    doc.text(empresa.razaoSocial, centerX, y + 12, { align: 'center' });
    y += 30;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${empresa.cidade}, ${new Date(recibo.dataEmissao).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}`, centerX, y, { align: 'center' });
}

// --- Função Principal ---
export function generateReciboPDF(recibo: ReciboData, empresa: EmpresaInfo) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    addHeader(doc, empresa);
    const yAfterHeader = addDadosPrincipais(doc, recibo, empresa);
    const yAfterTable = addTabelaItens(doc, recibo.itens, yAfterHeader);
    addTotaisDeclaracao(doc, recibo, empresa, yAfterTable);

    doc.save(`Recibo_${recibo.numero}.pdf`);
}
