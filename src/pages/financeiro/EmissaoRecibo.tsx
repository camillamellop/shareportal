import { useEffect, useMemo, useRef, useState } from "react";
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
import { Receipt, Download, Eye, Save, CheckCircle, FileText, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { conciliacaoService } from "@/services/conciliacaoService";
import { empresaService } from "@/services/empresaService";

// Firebase
import { getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  runTransaction,
  getDoc,
  startAt,
  endAt,
  limit as fbLimit,
  where, // <- para auto-preencher CNPJ no onBlur
} from "firebase/firestore";

// PDF util (layout idêntico ao preview)
import {
  generateReciboPDF,
  valorPorExtenso,
  type EmpresaInfo,
  type ReciboData,
} from "@/utils/recibo-pdf-util";

/* ==================== Firestore ==================== */
const db = getFirestore(getApp());

/* ==================== Helpers ==================== */
const localISODate = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Parse local "YYYY-MM-DD" (evita UTC -1)
const parseLocalDate = (input: string | Date): Date => {
  if (input instanceof Date) return input;
  if (typeof input === "string") {
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return new Date(input);
};
const formatDateBR = (input: string | Date) => parseLocalDate(input).toLocaleDateString("pt-BR");
const yearOfLocal = (input: string) => parseLocalDate(input).getFullYear();

const pad3 = (n: number) => String(n).padStart(3, "0");

/* ==================== Tipos ==================== */
interface ReciboForm {
  numero: string;
  data: string; // YYYY-MM-DD
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
  cliente_documento: string;
  valor: number;
  descricao: string;
  observacoes: string;
  despesa_criada: boolean;
  despesa_id?: string;
  createdAt: Date;
}
interface ClienteItem {
  id: string;
  razao_social: string;
  CNPJ?: string;
}

/* ==================== Sequência única por ANO ==================== */
const sequencesCol = "recibo_sequences";

async function peekNextNumber(year: number): Promise<string> {
  const ref = doc(db, sequencesCol, String(year));
  const snap = await getDoc(ref);
  const current = snap.exists() ? Number((snap.data() as any).current || 0) : 0;
  return `${pad3(current + 1)}/${year}`;
}

async function reserveNextNumber(year: number): Promise<string> {
  const ref = doc(db, sequencesCol, String(year));
  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(ref, { current: 1, updatedAt: serverTimestamp() });
      return 1;
    } else {
      const current = Number((snap.data() as any).current || 0) + 1;
      tx.update(ref, { current, updatedAt: serverTimestamp() });
      return current;
    }
  });
  return `${pad3(next)}/${year}`;
}

/* ==================== Componente ==================== */
export default function EmissaoRecibo() {
  const [formData, setFormData] = useState<ReciboForm>({
    numero: "",
    data: localISODate(),
    cliente_nome: "",
    cliente_documento: "",
    valor: 0,
    descricao: "",
    observacoes: "",
  });

  const [recibosEmitidos, setRecibosEmitidos] = useState<ReciboEmitido[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState<ReciboEmitido | null>(null);
  const [configEmpresa, setConfigEmpresa] = useState<EmpresaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNumero, setLoadingNumero] = useState(false);

  // Autocomplete de clientes
  const [clienteOptions, setClienteOptions] = useState<ClienteItem[]>([]);
  const [showClienteOptions, setShowClienteOptions] = useState(false);
  const clienteBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRecibos();
    loadConfigEmpresa();
  }, []);

  useEffect(() => {
    ensureProvisionalNumero();
  }, [formData.data]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (clienteBoxRef.current && !clienteBoxRef.current.contains(e.target as Node)) {
        setShowClienteOptions(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ======== Load dados Firestore ======== */
  const loadRecibos = async () => {
    setLoading(true);
    try {
      const qref = query(collection(db, "recibos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qref);
      const lista: ReciboEmitido[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          numero: data.numero,
          data: data.data,
          cliente_nome: data.cliente_nome,
          cliente_documento: data.cliente_documento || "",
          valor: Number(data.valor || 0),
          descricao: data.descricao || "",
          observacoes: data.observacoes || "",
          despesa_criada: !!data.despesa_criada,
          despesa_id: data.despesa_id,
          createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()) as Date,
        };
      });
      setRecibosEmitidos(lista);
    } catch (err) {
      console.error("Erro ao carregar recibos:", err);
      toast.error("Não foi possível carregar os recibos");
    } finally {
      setLoading(false);
    }
  };

  const loadConfigEmpresa = async () => {
    try {
      const config = await empresaService.getConfig();
      setConfigEmpresa(config as EmpresaInfo);
    } catch (error) {
      console.error("Erro ao carregar configuração da empresa:", error);
    }
  };

  const ensureProvisionalNumero = async () => {
    try {
      setLoadingNumero(true);
      const y = yearOfLocal(formData.data || localISODate());
      const next = await peekNextNumber(y);
      setFormData((prev) => ({ ...prev, numero: next }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNumero(false);
    }
  };

  const handleInputChange = (field: keyof ReciboForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* ======== Autocomplete Clientes (razao_social / CNPJ) ======== */
  const doSearchClientes = useMemo(() => {
    let timeout: number | undefined;
    return (term: string) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(async () => {
        const t = term.trim();
        if (!t) {
          setClienteOptions([]);
          return;
        }
        try {
          const qref = query(
            collection(db, "clientes"),
            orderBy("razao_social"),
            startAt(t),
            endAt(t + "\uf8ff"),
            fbLimit(10)
          );
          const snap = await getDocs(qref);
          const itens: ClienteItem[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return { id: d.id, razao_social: data.razao_social, CNPJ: data.CNPJ };
          });
          setClienteOptions(itens);
        } catch (e) {
          console.error(e);
        }
      }, 200); // debounce 200ms
    };
  }, []);

  // Tenta auto-preencher CNPJ buscando igualdade exata de razão social (onBlur)
  const tryAutofillCNPJByRazao = async (razao: string) => {
    const t = (razao || "").trim();
    if (!t) return;
    try {
      const qref = query(collection(db, "clientes"), where("razao_social", "==", t), fbLimit(1));
      const snap = await getDocs(qref);
      if (!snap.empty) {
        const data = snap.docs[0].data() as any;
        if (data?.CNPJ) {
          setFormData((prev) => ({ ...prev, cliente_documento: data.CNPJ }));
        }
      }
    } catch (e) {
      console.error("Autofill CNPJ falhou:", e);
    }
  };

  // Dispara a busca enquanto digita o pagador
  useEffect(() => {
    if (formData.cliente_nome) {
      setShowClienteOptions(true);
      doSearchClientes(formData.cliente_nome);
    } else {
      setClienteOptions([]);
    }
  }, [formData.cliente_nome, doSearchClientes]);

  /* ======== Salvar/Emitir ======== */
  const saveAndReturnRecibo = async (): Promise<ReciboEmitido | null> => {
    if (!formData.cliente_nome || !formData.valor || !formData.descricao) {
      toast.error("Preencha pagador, valor e descrição");
      return null;
    }
    try {
      const ano = yearOfLocal(formData.data);
      const numeroDefinitivo = await reserveNextNumber(ano);

      const base = {
        numero: numeroDefinitivo,
        data: formData.data,
        cliente_nome: formData.cliente_nome,
        cliente_documento: formData.cliente_documento || "",
        valor: Number(formData.valor || 0),
        descricao: formData.descricao,
        observacoes: formData.observacoes || "",
        despesa_criada: false,
        createdAt: serverTimestamp(),
      };
      const created = await addDoc(collection(db, "recibos"), base);
      const id = created.id;

      let despesaId: string | undefined = undefined;
      try {
        despesaId = await conciliacaoService.criarDespesaDeRecibo(id, {
          numero: base.numero,
          cliente_nome: base.cliente_nome,
          valor: base.valor,
          descricao: base.descricao,
          data: base.data,
        });
        await updateDoc(doc(db, "recibos", id), {
          despesa_criada: true,
          despesa_id: despesaId || null,
        });
      } catch (err) {
        console.error("Erro ao criar despesa:", err);
        toast.warning("Recibo criado, mas houve erro ao criar a despesa pendente");
      }

      const novo: ReciboEmitido = {
        id,
        ...base,
        despesa_criada: !!despesaId,
        despesa_id: despesaId,
        createdAt: new Date(),
      };
      setRecibosEmitidos((prev) => [novo, ...prev]);
      setFormData((prev) => ({ ...prev, numero: numeroDefinitivo }));
      return novo;
    } catch (error) {
      console.error("Erro ao salvar recibo:", error);
      toast.error("Erro ao salvar recibo");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const salvo = await saveAndReturnRecibo();
      if (salvo) {
        toast.success(salvo.despesa_criada ? "Recibo emitido e despesa criada!" : "Recibo emitido");
        const newDate = localISODate();
        const next = await peekNextNumber(yearOfLocal(newDate));
        setFormData({
          numero: next,
          data: newDate,
          cliente_nome: "",
          cliente_documento: "",
          valor: 0,
          descricao: "",
          observacoes: "",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecibo = async (reciboId: string) => {
    try {
      await deleteDoc(doc(db, "recibos", reciboId));
      setRecibosEmitidos((prev) => prev.filter((r) => r.id !== reciboId));
      toast.success("Recibo removido");
      ensureProvisionalNumero();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível remover");
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

  // Prévia: histórico ou formulário
  const previewData: ReciboEmitido | ReciboForm = selectedRecibo ?? formData;
  const isHistoryPreview = !!selectedRecibo;

  const buildEmpresaInfo = (): EmpresaInfo | null =>
    configEmpresa
      ? {
          razaoSocial: (configEmpresa as any).razaoSocial || "",
          cnpj: (configEmpresa as any).cnpj || "",
          telefone: (configEmpresa as any).telefone || "",
          endereco: (configEmpresa as any).endereco || "",
          cidade: (configEmpresa as any).cidade || "",
          estado: (configEmpresa as any).estado || "",
          cep: (configEmpresa as any).cep || "",
          logoUrl:
            (configEmpresa as any).logo || (configEmpresa as any).logoUrl || "https://i.ibb.co/qL88CDcV/Logo-Share.png",
          email: (configEmpresa as any).email || "",
          inscricaoMunicipal: (configEmpresa as any).inscricaoMunicipal || "",
        }
      : null;

  const buildReciboData = (rec: ReciboEmitido): ReciboData => ({
    numero: rec.numero,
    dataEmissao: rec.data,
    pagador: { nome: rec.cliente_nome, documento: rec.cliente_documento || "" },
    itens: [], // não exibimos itens; usamos apenas a descrição
    observacao: rec.observacoes || "",
    subtotal: rec.valor,
    desconto: 0,
    total: rec.valor,
    referenteA: rec.descricao, // campo adicional, usado no PDF para "Referente a"
  } as any);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emissão de Recibo</h1>
            <p className="text-muted-foreground mt-2">
              Pré-visualização idêntica ao PDF. Após salvar, o histórico permite apenas visualizar/baixar.
            </p>
          </div>
        </div>

        <Tabs defaultValue="novo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="novo">Novo Recibo</TabsTrigger>
            <TabsTrigger value="historico">Histórico ({recibosEmitidos.length})</TabsTrigger>
          </TabsList>

          {/* ========== NOVO ========== */}
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
                          value={loadingNumero ? "..." : formData.numero}
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

                    {/* Pagador + autocomplete */}
                    <div className="space-y-2" ref={clienteBoxRef}>
                      <Label htmlFor="cliente_nome">Pagador *</Label>
                      <div className="relative">
                        <Input
                          id="cliente_nome"
                          value={formData.cliente_nome}
                          onChange={(e) => {
                            handleInputChange("cliente_nome", e.target.value);
                            setShowClienteOptions(true);
                          }}
                          onFocus={() => {
                            if (formData.cliente_nome) setShowClienteOptions(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && showClienteOptions && clienteOptions.length > 0) {
                              const c = clienteOptions[0];
                              setFormData((prev) => ({
                                ...prev,
                                cliente_nome: c.razao_social,
                                cliente_documento: c.CNPJ || prev.cliente_documento,
                              }));
                              setShowClienteOptions(false);
                              e.preventDefault();
                            }
                          }}
                          onBlur={async () => {
                            await tryAutofillCNPJByRazao(formData.cliente_nome);
                          }}
                          placeholder="Digite a razão social para buscar..."
                        />
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                        {/* Dropdown */}
                        {showClienteOptions && clienteOptions.length > 0 && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow max-h-64 overflow-auto">
                            {clienteOptions.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    cliente_nome: c.razao_social,
                                    cliente_documento: c.CNPJ || prev.cliente_documento,
                                  }));
                                  setShowClienteOptions(false);
                                }}
                              >
                                <div className="font-medium text-sm text-gray-900">{c.razao_social}</div>
                                {c.CNPJ ? <div className="text-xs text-gray-500">CNPJ: {c.CNPJ}</div> : null}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cliente_documento">CNPJ</Label>
                      <Input
                        id="cliente_documento"
                        value={formData.cliente_documento}
                        onChange={(e) => handleInputChange("cliente_documento", e.target.value)}
                        placeholder="00.000.000/0000-00"
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
                      <Input id="valor-extenso" value={valorPorExtenso(Number(formData.valor || 0))} readOnly className="bg-muted" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Referente a</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => handleInputChange("descricao", e.target.value)}
                        placeholder="Descreva do que se trata o ressarcimento/serviço..."
                        rows={8}
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
                        Ao salvar este recibo, será criada automaticamente uma <strong>despesa pendente</strong> para o pagador.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button type="submit" disabled={submitting} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        {submitting ? "Salvando..." : "Emitir"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (!formData.cliente_nome || !formData.valor || !formData.descricao) {
                            toast.error("Preencha pagador, valor e descrição para visualizar");
                            return;
                          }
                          setSelectedRecibo(null);
                          setShowPreview(true);
                        }}
                        className="flex-1"
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

          {/* ========== HISTÓRICO ========== */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recibos Emitidos</span>
                  <Badge variant="secondary">{recibosEmitidos.length} recibos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : recibosEmitidos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum recibo emitido ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Pagador</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status Despesa</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recibosEmitidos.map((recibo) => (
                          <TableRow key={recibo.id}>
                            <TableCell className="font-medium">{recibo.numero}</TableCell>
                            <TableCell>{formatDateBR(recibo.data)}</TableCell>
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
                                    const empresa = buildEmpresaInfo();
                                    if (!empresa) return toast.error("Configuração da empresa não encontrada");
                                    generateReciboPDF(
                                      {
                                        numero: recibo.numero,
                                        dataEmissao: recibo.data,
                                        pagador: { nome: recibo.cliente_nome, documento: recibo.cliente_documento },
                                        itens: [],
                                        observacao: recibo.observacoes,
                                        subtotal: recibo.valor,
                                        desconto: 0,
                                        total: recibo.valor,
                                        referenteA: recibo.descricao,
                                      } as any,
                                      empresa
                                    );
                                  }}
                                  title="Baixar PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecibo(recibo);
                                    setShowPreview(true);
                                  }}
                                  title="Visualizar"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteRecibo(recibo.id)}
                                  title="Remover do histórico"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ========== MODAL: PRÉ-VISUALIZAÇÃO (idêntico ao PDF) ========== */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isHistoryPreview ? "Visualização do Recibo" : "Pré-visualização do Recibo"}
                {previewData.numero ? ` #${previewData.numero}` : ""}
              </DialogTitle>
            </DialogHeader>

            <div className="bg-white p-8 border rounded-lg" style={{ fontFamily: "Arial, sans-serif" }}>
              {/* Header: título + badge com NÚMERO */}
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">RECIBO DE PAGAMENTO</h2>
                <div className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <div className="inline-block rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 bg-white">
                      {previewData?.numero || "—"}
                    </div>
                    <div className="text-xs text-gray-600">Número do recibo</div>
                  </div>
                </div>
              </div>

              {/* Emissor / Pagador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-[11px] text-gray-500 uppercase mb-2">Emissor</div>
                  <div className="font-semibold text-gray-900">{(configEmpresa as any)?.razaoSocial || "Empresa"}</div>
                  {(configEmpresa as any)?.cnpj && <div className="text-sm text-gray-800 mt-1">CNPJ: {(configEmpresa as any).cnpj}</div>}
                  {(configEmpresa as any)?.telefone && <div className="text-sm text-gray-800">/ {(configEmpresa as any).telefone}</div>}
                  {((configEmpresa as any)?.endereco || (configEmpresa as any)?.cidade || (configEmpresa as any)?.estado || (configEmpresa as any)?.cep) && (
                    <div className="text-sm text-gray-800 mt-2 leading-5">
                      {(configEmpresa as any)?.endereco}
                      <br />
                      {(configEmpresa as any)?.cidade} - {(configEmpresa as any)?.estado}, {(configEmpresa as any)?.cep}
                    </div>
                  )}
                  {(configEmpresa as any)?.email && (
                    <div className="text-sm text-gray-800 mt-2">{(configEmpresa as any).email}</div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] text-gray-500 uppercase mb-2">Pagador</div>
                  <div className="font-semibold text-gray-900">{(previewData as any).cliente_nome || ""}</div>
                  {(previewData as any).cliente_documento && (
                    <div className="text-sm text-gray-800 mt-1">CNPJ: {(previewData as any).cliente_documento}</div>
                  )}
                  <div className="text-sm text-gray-800 mt-2">
                    Data de emissão: {(previewData as any).data ? formatDateBR((previewData as any).data) : ""}
                  </div>
                </div>
              </div>

              {/* Referente a (sem tabela) */}
              <div className="mb-4">
                <div className="bg-gray-100 text-xs font-semibold uppercase px-4 py-2 rounded-t-md border border-b-0">
                  Referente a
                </div>
                <div className="border rounded-b-md p-4 text-sm leading-6">
                  {(previewData as any).descricao || ""}
                </div>
              </div>

              {/* TOTAL */}
              <div className="w-full md:w-80 ml-auto text-sm">
                <div className="flex items-center justify-between py-1 border-t mt-1 pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      Number((previewData as any).valor || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Observação */}
              {(previewData as any).observacoes && (
                <div className="bg-gray-50 border rounded-md p-3 mt-4 text-sm">
                  <b>Observação:</b> {(previewData as any).observacoes}
                </div>
              )}

              {/* Declaração */}
              <div className="text-sm text-gray-900 mt-4 leading-6">
                <b>Declaração:</b> Recebemos de <b>{(previewData as any).cliente_nome || ""}</b>, a importância de{" "}
                <b>{valorPorExtenso(Number((previewData as any).valor || 0))}</b>, referente ao descrito acima. Para maior
                clareza, firmo o presente recibo para que produza seus efeitos, dando plena, geral e irrevogável
                quitação pelo valor recebido.
              </div>

              {/* Assinatura + LOGO */}
              <div className="text-center mt-10">
                <div className="flex flex-col items-center gap-3">
                  {(configEmpresa as any)?.logoUrl || (configEmpresa as any)?.logo ? (
                    <img
                      src={(configEmpresa as any).logoUrl || (configEmpresa as any).logo}
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <img
                      src={"https://i.ibb.co/qL88CDcV/Logo-Share.png"}
                      alt="Logo"
                      className="h-12 w-auto object-contain"
                    />
                  )}
                  <div className="w-64 border-b border-gray-700 mb-1"></div>
                  <p className="text-sm text-gray-900 font-medium">{(configEmpresa as any)?.razaoSocial || "Empresa"}</p>
                  <p className="text-sm text-gray-600">
                    {(configEmpresa as any)?.cidade || "Cidade"},{" "}
                    {(previewData as any).data
                      ? parseLocalDate((previewData as any).data).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Ações do modal */}
            <div className="flex justify-end gap-2 mt-4">
              {isHistoryPreview ? (
                <>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      const empresa = buildEmpresaInfo();
                      if (!empresa || !selectedRecibo) return toast.error("Dados ausentes");
                      generateReciboPDF(
                        {
                          numero: selectedRecibo.numero,
                          dataEmissao: selectedRecibo.data,
                          pagador: { nome: selectedRecibo.cliente_nome, documento: selectedRecibo.cliente_documento },
                          itens: [],
                          observacao: selectedRecibo.observacoes,
                          subtotal: selectedRecibo.valor,
                          desconto: 0,
                          total: selectedRecibo.valor,
                          referenteA: selectedRecibo.descricao,
                        } as any,
                        empresa
                      );
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Voltar e editar
                  </Button>
                  <Button
                    onClick={async () => {
                      const salvo = await saveAndReturnRecibo();
                      if (!salvo) return;
                      const empresa = buildEmpresaInfo();
                      if (!empresa) return toast.error("Configuração da empresa não encontrada");
                      generateReciboPDF(
                        {
                          numero: salvo.numero,
                          dataEmissao: salvo.data,
                          pagador: { nome: salvo.cliente_nome, documento: salvo.cliente_documento },
                          itens: [],
                          observacao: salvo.observacoes,
                          subtotal: salvo.valor,
                          desconto: 0,
                          total: salvo.valor,
                          referenteA: salvo.descricao,
                        } as any,
                        empresa
                      );
                      toast.success("PDF gerado. Recibo salvo no histórico.");
                      const newDate = localISODate();
                      const next = await peekNextNumber(yearOfLocal(newDate));
                      setFormData({
                        numero: next,
                        data: newDate,
                        cliente_nome: "",
                        cliente_documento: "",
                        valor: 0,
                        descricao: "",
                        observacoes: "",
                      });
                      setSelectedRecibo(null);
                      setShowPreview(false);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar PDF e salvar
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
