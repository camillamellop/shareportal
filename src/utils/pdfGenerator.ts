import jsPDF from 'jspdf';
import { empresaService, ConfigEmpresa } from '@/services/empresaService';

export class PDFGenerator {
  private static async getCompanyConfig(): Promise<ConfigEmpresa> {
    try {
      const config = await empresaService.getConfig();
      return config || {
        razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
        cnpj: "30.898.549/0001-06",
        inscricaoMunicipal: "102832",
        endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
        cidade: "Várzea Grande",
        estado: "MT",
        cep: "78125-100"
      };
    } catch (error) {
      console.error('Erro ao carregar configuração da empresa:', error);
      // Retornar configuração padrão em caso de erro
      return {
        razaoSocial: "SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI",
        cnpj: "30.898.549/0001-06",
        inscricaoMunicipal: "102832",
        endereco: "Av. Presidente Artur Bernardes, 1457 - Vila Ipase",
        cidade: "Várzea Grande",
        estado: "MT",
        cep: "78125-100"
      };
    }
  }

  static async generateCobrancaPDF(data: {
    nomeCliente: string;
    referencia: string;
    valor: string;
    vencimento: string;
    chavePix: string;
    observacoes: string;
  }): Promise<void> {
    const config = await this.getCompanyConfig();
    const pdf = new jsPDF();
    
    // Cabeçalho da empresa
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.razaoSocial, 105, 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`CNPJ: ${config.cnpj} • Inscrição Municipal: ${config.inscricaoMunicipal}`, 105, 30, { align: 'center' });
    pdf.text(`${config.endereco}, ${config.cidade} - ${config.estado}, ${config.cep}`, 105, 37, { align: 'center' });
    
    if (config.telefone || config.email) {
      const contatos = [];
      if (config.telefone) contatos.push(`Tel: ${config.telefone}`);
      if (config.email) contatos.push(`E-mail: ${config.email}`);
      pdf.text(contatos.join(' • '), 105, 44, { align: 'center' });
    }
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 50, 190, 50);
    
    // Título do documento
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('COBRANÇA', 105, 65, { align: 'center' });
    
    // Dados da cobrança
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dados da Cobrança:', 20, 80);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Cliente: ${data.nomeCliente}`, 20, 95);
    pdf.text(`Referência: ${data.referencia}`, 20, 105);
    pdf.text(`Valor: R$ ${parseFloat(data.valor).toFixed(2)}`, 20, 115);
    pdf.text(`Vencimento: ${new Date(data.vencimento).toLocaleDateString('pt-BR')}`, 20, 125);
    
    if (data.observacoes) {
      pdf.text('Observações:', 20, 140);
      pdf.setFontSize(8);
      const observacoes = pdf.splitTextToSize(data.observacoes, 170);
      pdf.text(observacoes, 20, 150);
    }
    
    // Chave PIX
    if (data.chavePix) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Chave PIX:', 20, 170);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const chavePix = pdf.splitTextToSize(data.chavePix, 170);
      pdf.text(chavePix, 20, 180);
    }
    
    // Salvar PDF
    const fileName = `cobranca_${data.nomeCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }

  static async generateReciboPDF(data: {
    numero: string;
    cliente_nome: string;
    valor: number;
    descricao: string;
    data: string;
    forma_pagamento: string;
  }): Promise<void> {
    const config = await this.getCompanyConfig();
    const pdf = new jsPDF();
    
    // Cabeçalho da empresa
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.razaoSocial, 105, 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`CNPJ: ${config.cnpj} • Inscrição Municipal: ${config.inscricaoMunicipal}`, 105, 30, { align: 'center' });
    pdf.text(`${config.endereco}, ${config.cidade} - ${config.estado}, ${config.cep}`, 105, 37, { align: 'center' });
    
    if (config.telefone || config.email) {
      const contatos = [];
      if (config.telefone) contatos.push(`Tel: ${config.telefone}`);
      if (config.email) contatos.push(`E-mail: ${config.email}`);
      pdf.text(contatos.join(' • '), 105, 44, { align: 'center' });
    }
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 50, 190, 50);
    
    // Título do documento
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIBO', 105, 65, { align: 'center' });
    
    // Dados do recibo
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dados do Recibo:', 20, 80);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Número: ${data.numero}`, 20, 95);
    pdf.text(`Cliente: ${data.cliente_nome}`, 20, 105);
    pdf.text(`Valor: R$ ${data.valor.toFixed(2)}`, 20, 115);
    pdf.text(`Data: ${new Date(data.data).toLocaleDateString('pt-BR')}`, 20, 125);
    pdf.text(`Forma de Pagamento: ${data.forma_pagamento}`, 20, 135);
    
    if (data.descricao) {
      pdf.text('Descrição:', 20, 150);
      pdf.setFontSize(8);
      const descricao = pdf.splitTextToSize(data.descricao, 170);
      pdf.text(descricao, 20, 160);
    }
    
    // Salvar PDF
    const fileName = `recibo_${data.numero}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }

  static async generateRelatorioViagemPDF(data: {
    numero: string;
    colaborador_nome: string;
    valor_total: number;
    descricao: string;
    data: string;
    destino: string;
    despesas: any[];
  }): Promise<void> {
    const config = await this.getCompanyConfig();
    const pdf = new jsPDF();
    
    // Cabeçalho da empresa
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(config.razaoSocial, 105, 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`CNPJ: ${config.cnpj} • Inscrição Municipal: ${config.inscricaoMunicipal}`, 105, 30, { align: 'center' });
    pdf.text(`${config.endereco}, ${config.cidade} - ${config.estado}, ${config.cep}`, 105, 37, { align: 'center' });
    
    if (config.telefone || config.email) {
      const contatos = [];
      if (config.telefone) contatos.push(`Tel: ${config.telefone}`);
      if (config.email) contatos.push(`E-mail: ${config.email}`);
      pdf.text(contatos.join(' • '), 105, 44, { align: 'center' });
    }
    
    // Linha separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 50, 190, 50);
    
    // Título do documento
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO DE VIAGEM', 105, 65, { align: 'center' });
    
    // Dados do relatório
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dados do Relatório:', 20, 80);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Número: ${data.numero}`, 20, 95);
    pdf.text(`Colaborador: ${data.colaborador_nome}`, 20, 105);
    pdf.text(`Destino: ${data.destino}`, 20, 115);
    pdf.text(`Valor Total: R$ ${data.valor_total.toFixed(2)}`, 20, 125);
    pdf.text(`Data: ${new Date(data.data).toLocaleDateString('pt-BR')}`, 20, 135);
    
    if (data.descricao) {
      pdf.text('Descrição:', 20, 150);
      pdf.setFontSize(8);
      const descricao = pdf.splitTextToSize(data.descricao, 170);
      pdf.text(descricao, 20, 160);
    }
    
    // Lista de despesas (se houver)
    if (data.despesas && data.despesas.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Despesas:', 20, 180);
      
      let yPosition = 190;
      data.despesas.forEach((despesa, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${index + 1}. ${despesa.categoria}: ${despesa.descricao} - R$ ${despesa.valor.toFixed(2)}`, 20, yPosition);
        yPosition += 8;
      });
    }
    
    // Salvar PDF
    const fileName = `relatorio_viagem_${data.numero}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  }
}
