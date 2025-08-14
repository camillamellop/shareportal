import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, Download, Eye, Save, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { conciliacaoService } from "@/services/conciliacaoService";
import { empresaService } from "@/services/empresaService";
import { PDFGenerator } from "@/utils/pdfGenerator";

interface ReciboForm {
  numero: string;
  data: string;
  cliente_nome: string;
  cliente_documento: string;
  valor: number;
  descricao: string;
  observacoes: string;
}

interface ReciboEmitido {
  id: string;
  numero: string;
  data: string;
  cliente_nome: string;
  valor: number;
  descricao: string;
  despesa_criada: boolean;
  despesa_id?: string;
  createdAt: Date;
}

export default function EmissaoRecibo() {
  const [formData, setFormData] = useState<ReciboForm>({
    numero: "",
    data: new Date().toISOString().split("T")[0],
    cliente_nome: "",
    cliente_documento: "",
    valor: 0,
    descricao: "",
    observacoes: "",
  });

  const [recibosEmitidos, setRecibosEmitidos] = useState<ReciboEmitido[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [configEmpresa, setConfigEmpresa] = useState<any>(null);

  // Carrega configurações e histórico (se houver) ao montar
  useEffect(() => {
    loadRecibos();
    loadConfigEmpresa();
  }, []);

  // Atualiza automaticamente o próximo número quando o histórico mudar
  useEffect(() => {
    generateNextNumber();
  }, [recibosEmitidos]);

  const loadRecibos = async () => {
    // TODO: substituir por fetch real quando o serviço estiver pronto
    setRecibosEmitidos([]);
  };

  const loadConfigEmpresa = async () => {
    try {
      const config = await empresaService.getConfig();
      setConfigEmpresa(config);
    } catch (error) {
      // Apenas log técnico; não exibimos mensagens genéricas
      console.error("Erro ao carregar configuração da empresa:", error);
    }
  };

  const generateNextNumber = () => {
    const year = new Date().getFullYear();
    // Busca o maior seq. do ano atual no histórico local
    const sequenciasDoAno = recibosEmitidos
      .filter((r) => r.numero?.includes(`/${year}`))
      .map((r) => {
        const [seq] = r.numero.split("/");
        return Number(seq) || 0;
      });

    const maiorSeq = sequenciasDoAno.length ? Math.max(...sequenciasDoAno) : 0;
    const nextSeq = String(maiorSeq + 1).padStart(3, "0");
    setFormData((prev) => ({ ...prev, numero: `${nextSeq}/${year}` }));
  };

  const valorPorExtenso = (valor: number): string => {
    if (!valor) return "";
    // Mantendo simples conforme seu original
    return `${valor.toFixed(2).replace(".", ",")} reais`;
  };

  const handleInputChange = (field: keyof ReciboForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cliente_nome || !formData.valor || !formData.descricao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const reciboId = `recibo_${Date.now()}`;

      const despesaId = await conciliacaoService.criarDespesaDeRecibo(reciboId, {
        numero: formData.numero,
        cliente_nome: formData.cliente_nome,
        valor: formData.valor,
        descricao: formData.descricao,
        data: formData.data,
      });

      // Adiciona ao histórico local para manter o sequencial
      setRecibosEmitidos((prev) => [
        ...prev,
        {
          id: reciboId,
          numero: formData.numero,
          data: formData.data,
          cliente_nome: formData.cliente_nome,
          valor: formData.valor,
          descricao: formData.descricao,
          despesa_criada: !!despesaId,
          despesa_id: despesaId,
          createdAt: new Date(),
        },
      ]);

      toast.success("Recibo emitido e despesa pendente criada!");

      // Reset do formulário (o número é recalculado pelo useEffect acima)
      setFormData({
        numero: "",
        data: new Date().toISOString().split("T")[0],
        cliente_nome: "",
        cliente_documento: "",
        valor: 0,
        descricao: "",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao emitir recibo:", error);
      toast.error("Erro ao emitir recibo");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR");

  const generateReciboPDF = async () => {
    try {
      await PDFGenerator.generateReciboPDF({
        numero: formData.numero,
        cliente_nome: formData.cliente_nome,
        valor: formData.valor,
        descricao: formData.descricao,
        data: formData.data,
        forma_pagamento: "Transferência Bancária",
      });
      toast.success("PDF do recibo gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF do recibo:", error);
      toast.error("Erro ao gerar PDF do recibo");
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emissão de Recibo</h1>
            <p className="text-muted-foreground mt-2">Gere recibos e crie automaticamente despesas para ressarcimento</p>
          </div>
        </div>

        <Tabs defaultValue="novo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="novo">Novo Recibo</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Dados do Recibo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número do Recibo *</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) => handleInputChange("numero", e.target.value)}
                          placeholder="001/2025"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="data">Data de Emissão *</Label>
                        <Input
                          id="data"
                          type="date"
                          value={formData.data}
                          onChange={(e) => handleInputChange("data", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                      <Input
                        id="cliente_nome"
                        value={formData.cliente_nome}
                        onChange={(e) => handleInputChange("cliente_nome", e.target.value)}
                        placeholder="Nome completo do cliente"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cliente_documento">CPF/CNPJ</Label>
                      <Input
                        id="cliente_documento"
                        value={formData.cliente_documento}
                        onChange={(e) => handleInputChange("cliente_documento", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) => handleInputChange("valor", parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor-extenso">Valor por Extenso</Label>
                      <Input id="valor-extenso" value={valorPorExtenso(formData.valor)} readOnly className="bg-muted" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Referente  *</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => handleInputChange("descricao", e.target.value)}
                        placeholder="Descrição detalhada do serviço prestado..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => handleInputChange("observacoes", e.target.value)}
                        placeholder="Observações adicionais..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Processo Automático</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Ao salvar este recibo, será criada automaticamente uma <strong>despesa pendente</strong> para o
                        cliente, iniciando o processo de ressarcimento.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {submitting ? "Salvando..." : "Emitir Recibo"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(true)}
                        disabled={!formData.cliente_nome || !formData.valor || !formData.descricao}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recibos Emitidos</CardTitle>
              </CardHeader>
              <CardContent>
                {recibosEmitidos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum recibo emitido ainda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status Despesa</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recibosEmitidos.map((recibo) => (
                        <TableRow key={recibo.id}>
                          <TableCell className="font-medium">{recibo.numero}</TableCell>
                          <TableCell>{formatDate(recibo.data)}</TableCell>
                          <TableCell>{recibo.cliente_nome}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(recibo.valor)}</TableCell>
                          <TableCell>
                            {recibo.despesa_criada ? (
                              <Badge className="bg-green-100 text-green-800">Despesa Criada</Badge>
                            ) : (
                              <Badge variant="secondary">Sem Despesa</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // placeholder
                                  toast.info("Funcionalidade será implementada em breve");
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pré-visualização do Recibo #{formData.numero}</DialogTitle>
            </DialogHeader>

            <div className="bg-white p-8 border rounded-lg" style={{ fontFamily: "Arial, sans-serif" }}>
              {configEmpresa && (
                <div className="text-center mb-8 pb-6 border-b-2 border-black-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 text-left">
                      <h1 className="text-xl font-bold text-black-900 mb-3">{configEmpresa.razaoSocial}</h1>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <strong>CNPJ:</strong> {configEmpresa.cnpj}{" "}
                          {configEmpresa.inscricaoMunicipal && `• Inscrição Municipal: ${configEmpresa.inscricaoMunicipal}`}
                        </p>
                        <p>
                          <strong>Endereço:</strong> {configEmpresa.endereco}, {configEmpresa.cidade} -{" "}
                          {configEmpresa.estado}, {configEmpresa.cep}
                        </p>
                        {(configEmpresa.telefone || configEmpresa.email) && (
                          <p>
                            {configEmpresa.telefone && `Tel: ${configEmpresa.telefone}`}
                            {configEmpresa.telefone && configEmpresa.email && " • "}
                            {configEmpresa.email && `E-mail: ${configEmpresa.email}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {configEmpresa.logo && (
                      <div className="ml-6 flex-shrink-0">
                        <img src={configEmpresa.logo} alt="Logo" className="h-20 w-auto object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">RECIBO</h2>
                <p className="text-lg text-gray-700">Nº {formData.numero}</p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Data de Emissão:</p>
                    <p className="font-semibold">{new Date(formData.data).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valor:</p>
                    <p className="font-semibold text-xl">{formatCurrency(formData.valor)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                  <p className="font-semibold">{formData.cliente_nome}</p>
                  {formData.cliente_documento && (
                    <p className="text-sm text-gray-600">CPF/CNPJ: {formData.cliente_documento}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor por Extenso:</p>
                  <p className="font-semibold">{valorPorExtenso(formData.valor)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Referente a:</p>
                  <div className="border border-gray-300 rounded p-4 min-h-[100px]">
                    <p>{formData.descricao}</p>
                  </div>
                </div>

                {formData.observacoes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Observações:</p>
                    <p className="text-sm">{formData.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="text-center mt-12 pt-8 border-t border-gray-300">
                <div className="inline-block">
                  <div className="w-64 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">Assinatura</p>
                </div>
              </div>

              <div className="text-center mt-8">
                <p className="text-sm text-gray-600">
                  {configEmpresa?.cidade},{" "}
                  {new Date(formData.data).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Fechar
              </Button>
              <Button onClick={generateReciboPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
