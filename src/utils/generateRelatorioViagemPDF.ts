import { jsPDF } from "jspdf";
import "jspdf-autotable";

// --- Interfaces ---
interface DespesaViagem { 
    id: string; categoria: string; descricao: string; valor: number; 
    data: any; pago_por: string; comprovante_url?: string; comprovante_nome?: string; 
}
interface RelatorioViagem { 
    numero: string; cotista: string; aeronave: string; tripulante: string; 
    destino: string; data_inicio: any; data_fim: any; despesas: DespesaViagem[]; 
    observacoes: string; 
}
interface EmpresaInfo {
    razaoSocial: string; cnpj: string; endereco: string; cidade: string;
    estado: string; cep: string;
}

// --- Função Auxiliar para converter Imagem ---
// Converte uma URL de imagem para um formato Data URL (base64)
async function imageToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// --- Funções de Desenho do PDF ---
// (addHeaderAndBackground e addReportInfo permanecem as mesmas)

// --- NOVA FUNÇÃO para adicionar a página de comprovantes ---
async function addComprovantesPage(doc: jsPDF, despesas: DespesaViagem[]) {
  const despesasComComprovante = despesas.filter(d => d.comprovante_url);

  if (despesasComComprovante.length === 0) {
    return; // Não faz nada se não houver comprovantes
  }

  for (const despesa of despesasComComprovante) {
    if (despesa.comprovante_url) {
      try {
        // Verifica se o comprovante é uma imagem
        if (/\.(jpg|jpeg|png)$/i.test(despesa.comprovante_url)) {
            const imageDataUrl = await imageToDataUrl(despesa.comprovante_url);
            
            doc.addPage();
            doc.setFontSize(14);
            doc.setTextColor("#333");
            doc.text(`Comprovante da Despesa: ${despesa.descricao}`, 20, 20);
            doc.text(`Valor: ${despesa.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 20, 30);
            
            // Adiciona a imagem à nova página
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            // Centraliza a imagem com margens
            doc.addImage(imageDataUrl, 'JPEG', 20, 40, pageWidth - 40, pageHeight - 60);
        } else {
            // Se for um PDF ou outro tipo, apenas adiciona um link
            doc.addPage();
            doc.setFontSize(12);
            doc.text(`Comprovante (Link Externo): ${despesa.descricao}`, 20, 20);
            doc.setTextColor("#007BFF");
            doc.textWithLink("Clique aqui para ver o comprovante", 20, 30, { url: despesa.comprovante_url });
        }

      } catch (error) {
        console.error("Erro ao adicionar imagem do comprovante ao PDF:", error);
        // Adiciona uma página de erro se a imagem não puder ser carregada
        doc.addPage();
        doc.setFontSize(12);
        doc.setTextColor("#FF0000");
        doc.text(`Não foi possível carregar o comprovante para: ${despesa.descricao}`, 20, 20);
      }
    }
  }
}

// --- Função Principal de Geração de PDF ---
export async function generateRelatorioViagemPDF(
    relatorio: RelatorioViagem,
    totals: any,
    empresa: EmpresaInfo
) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    
    // Página 1: Relatório Principal
    // addHeaderAndBackground(doc, empresa);
    // const yAfterInfo = addReportInfo(doc, relatorio);
    // addExpensesTable(doc, relatorio.despesas, yAfterInfo);
    // addTotalsAndSignature(doc, totals, relatorio.observacoes, yAfterTable); // Adicione suas funções de layout aqui

    // Páginas Adicionais: Comprovantes
    await addComprovantesPage(doc, relatorio.despesas);
    
    // Salva o arquivo
    doc.save(`${relatorio.numero}.pdf`);
}